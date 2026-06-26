import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Exercise, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';

interface TestAnswer {
  exerciseId: string;
  answer: Record<string, unknown>;
}

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
  ) {}

  async list(user: { sub: string; role: string }) {
    const tests = await this.prisma.test.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        topicIds: true,
        questionIds: true,
        durationMin: true,
        createdAt: true,
      },
    });

    if (user.role === 'STUDENT') {
      // Attach the student's best completed attempt per test.
      const attempts = await this.prisma.testAttempt.findMany({
        where: { userId: user.sub, completedAt: { not: null } },
        select: { testId: true, score: true, completedAt: true },
      });
      const best = new Map<string, { score: number; completedAt: Date }>();
      for (const a of attempts) {
        const prev = best.get(a.testId);
        if (!prev || a.score > prev.score) {
          best.set(a.testId, { score: a.score, completedAt: a.completedAt! });
        }
      }
      return tests.map(({ questionIds, ...t }) => {
        const at = best.get(t.id);
        return {
          ...t,
          questionCount: questionIds.length,
          attempt: at ?? null,
        };
      });
    }

    // Teacher: attach aggregate stats per test.
    const grouped = await this.prisma.testAttempt.groupBy({
      by: ['testId'],
      where: { completedAt: { not: null } },
      _count: { _all: true },
      _avg: { score: true },
    });
    const stats = new Map(
      grouped.map((g) => [
        g.testId,
        { attempts: g._count._all, avgScore: g._avg.score },
      ]),
    );
    return tests.map(({ questionIds, ...t }) => {
      const s = stats.get(t.id);
      return {
        ...t,
        questionCount: questionIds.length,
        attempts: s?.attempts ?? 0,
        avgScore: s?.avgScore ?? null,
      };
    });
  }

  async getById(id: string) {
    const test = await this.prisma.test.findUnique({ where: { id } });
    if (!test) throw new NotFoundException(`Test "${id}" not found`);

    // Questions without correct answers (stripped payload)
    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: test.questionIds } },
      select: { id: true, type: true, prompt: true, payload: true },
    });
    const questions = exercises.map((e) => ({
      id: e.id,
      type: e.type,
      prompt: e.prompt,
      payload: this.stripAnswers(e.payload as Record<string, unknown>),
    }));

    return { ...test, questions };
  }

  /** Start an attempt. Students only; PRE/POST/DELAYED can be taken once. */
  async startAttempt(userId: string, testId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true },
    });
    if (user.role !== 'STUDENT') {
      throw new BadRequestException(
        'Tests are for students. Teachers can preview questions via GET /tests/:id.',
      );
    }

    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException(`Test "${testId}" not found`);

    if (test.type !== 'QUIZ') {
      const existing = await this.prisma.testAttempt.findFirst({
        where: { userId, testId },
      });
      if (existing) {
        throw new BadRequestException('This test can be taken only once');
      }
    }

    const attempt = await this.prisma.testAttempt.create({
      data: { userId, testId, answers: {} },
    });
    this.events.log(userId, 'start_test', { testId, type: test.type });
    return attempt;
  }

  /** Submit all answers; deterministic scoring, no AI. */
  async submitAttempt(
    userId: string,
    attemptId: string,
    answers: TestAnswer[],
  ) {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: attemptId },
      include: { test: true },
    });
    if (!attempt || attempt.userId !== userId) {
      throw new NotFoundException('Attempt not found');
    }
    if (attempt.completedAt) {
      throw new BadRequestException('Attempt already submitted');
    }

    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: attempt.test.questionIds } },
    });
    const byId = new Map(exercises.map((e) => [e.id, e]));

    // Reveal correct answers only for QUIZ (repeatable, learning-focused).
    // PRE/POST/DELAYED keep answers hidden for research integrity.
    const isQuiz = attempt.test.type === 'QUIZ';
    let correct = 0;
    const detailed = answers.map((a) => {
      const ex = byId.get(a.exerciseId);
      const isCorrect = ex ? this.check(ex, a.answer) : false;
      if (isCorrect) correct++;
      const base = { exerciseId: a.exerciseId, isCorrect };
      if (isQuiz && ex) {
        const p = ex.payload as Record<string, unknown>;
        return {
          ...base,
          solution: {
            correctAnswerId: p.correctAnswerId ?? null,
            correctAnswers: p.correctAnswers ?? null,
            correctAnswer: p.correctAnswer ?? null,
            explanation: p.explanation ?? null,
          },
        };
      }
      return base;
    });

    const total = attempt.test.questionIds.length;
    const score = total > 0 ? (correct / total) * 100 : 0;

    const updated = await this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        answers: answers as unknown as Prisma.InputJsonValue,
        score,
        completedAt: new Date(),
      },
    });
    this.events.log(userId, 'submit_test', {
      testId: attempt.testId,
      score,
    });

    return { id: updated.id, score, correct, total, detailed };
  }

  private check(ex: Exercise, ans: Record<string, unknown>): boolean {
    const p = ex.payload as Record<string, unknown>;
    switch (ex.type) {
      case 'MULTIPLE_CHOICE':
        return ans.selectedOptionId === p.correctAnswerId;
      case 'TRUE_FALSE':
        return ans.answer === p.correctAnswer;
      case 'FILL_IN_BLANK':
        return ((p.correctAnswers as string[]) ?? []).some(
          (c) =>
            c.toLowerCase().trim() ===
            String(ans.text ?? '').toLowerCase().trim(),
        );
      case 'REORDER':
        return JSON.stringify(ans.order) === JSON.stringify(p.correctOrder);
      case 'MATCHING':
        return JSON.stringify(ans.pairs) === JSON.stringify(p.pairs);
      default:
        return false;
    }
  }

  private stripAnswers(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    const {
      correctAnswerId: _a,
      correctAnswers: _b,
      correctAnswer: _c,
      correctOrder: _d,
      pairs: _e,
      explanation: _f,
      ...rest
    } = payload;
    return rest;
  }
}
