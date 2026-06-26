import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExerciseType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratorService } from '../ai/generator.service';
import { difficultyToLogit } from '../exercises/exercises.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { GenerateTestDto } from './dto/generate-test.dto';

@Injectable()
export class TeacherService {
  constructor(
    private prisma: PrismaService,
    private generator: GeneratorService,
  ) {}

  // ===== STUDENT LIST WITH PROGRESS =====
  async getStudents() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        fullName: true,
        experimentArm: true,
        studyGroupId: true,
        createdAt: true,
        topicMastery: { select: { masteryPct: true } },
        _count: { select: { submissions: true } },
        submissions: {
          where: { createdAt: { gte: weekAgo } },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const lastActive = await this.prisma.submission.groupBy({
      by: ['userId'],
      _max: { createdAt: true },
    });
    const lastActiveMap = new Map(
      lastActive.map((s) => [s.userId, s._max.createdAt]),
    );

    return students.map((s) => {
      const masteries = s.topicMastery.map((m) => m.masteryPct);
      const averageMastery =
        masteries.length > 0
          ? masteries.reduce((a, b) => a + b, 0) / masteries.length
          : 0;

      return {
        id: s.id,
        email: s.email,
        fullName: s.fullName ?? null,
        group: s.experimentArm,
        studyGroupId: s.studyGroupId,
        registeredAt: s.createdAt,
        averageMastery: Math.round(averageMastery * 10) / 10,
        totalSubmissions: s._count.submissions,
        submissionsThisWeek: s.submissions.length,
        lastActiveAt: lastActiveMap.get(s.id) ?? null,
      };
    });
  }

  // ===== DETAILED STUDENT PROGRESS =====
  async getStudentDetails(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        role: true,
        experimentArm: true,
        studyGroupId: true,
        fullName: true,
        createdAt: true,
      },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException(`Student with id "${studentId}" not found`);
    }

    const [mastery, recentSubmissions, stats] = await Promise.all([
      this.prisma.topicMastery.findMany({
        where: { userId: studentId },
        include: {
          topic: { select: { id: true, title: true, slug: true, unit: true } },
        },
        orderBy: { masteryPct: 'asc' },
      }),
      this.prisma.submission.findMany({
        where: { userId: studentId },
        include: {
          exercise: { select: { id: true, prompt: true, type: true } },
          speaking: {
            select: { clarity: true, grammar: true, pace: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.submission.aggregate({
        where: { userId: studentId },
        _count: true,
      }),
    ]);

    const correctCount = await this.prisma.submission.count({
      where: { userId: studentId, isCorrect: true },
    });

    return {
      student: { ...student, group: student.experimentArm }, // FE compat
      mastery,
      recentSubmissions,
      stats: {
        totalSubmissions: stats._count,
        correctSubmissions: correctCount,
        accuracy:
          stats._count > 0
            ? Math.round((correctCount / stats._count) * 1000) / 10
            : 0,
      },
    };
  }

  // ===== HEATMAP: WHICH TOPICS ARE HARD =====
  async getHeatmap() {
    const topics = await this.prisma.topic.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        unit: true,
        mastery: { select: { masteryPct: true, attempts: true } },
      },
      orderBy: [{ unit: 'asc' }, { order: 'asc' }],
    });

    return topics.map((t) => {
      const masteries = t.mastery.map((m) => m.masteryPct);
      const attempts = t.mastery.reduce((sum, m) => sum + m.attempts, 0);
      const avgMastery =
        masteries.length > 0
          ? masteries.reduce((a, b) => a + b, 0) / masteries.length
          : null;

      return {
        topicId: t.id,
        title: t.title,
        slug: t.slug,
        unit: t.unit,
        studentsAttempted: masteries.length,
        totalAttempts: attempts,
        averageMastery:
          avgMastery !== null ? Math.round(avgMastery * 10) / 10 : null,
        difficultyFlag:
          avgMastery !== null && avgMastery < 60 ? 'hard' : 'ok',
      };
    });
  }

  // ===== ASSIGNMENTS =====
  async createAssignment(teacherId: string, dto: CreateAssignmentDto) {
    // Validate topic ids
    const topics = await this.prisma.topic.findMany({
      where: { id: { in: dto.topicIds } },
      select: { id: true },
    });
    const foundIds = new Set(topics.map((t) => t.id));
    const missing = dto.topicIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(`Topics not found: ${missing.join(', ')}`);
    }

    return this.prisma.assignment.create({
      data: {
        createdBy: teacherId,
        title: dto.title,
        description: dto.description,
        topicIds: dto.topicIds,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async getAssignments(teacherId: string) {
    return this.prisma.assignment.findMany({
      where: { createdBy: teacherId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== AI EXERCISE VALIDATION QUEUE =====
  async pendingExercises() {
    // Exclude exercises that belong to a test — those are test-only questions
    // (also kept out of the practice pool), not items awaiting practice review.
    const tests = await this.prisma.test.findMany({
      select: { questionIds: true },
    });
    const inTests = [...new Set(tests.flatMap((t) => t.questionIds))];
    return this.prisma.exercise.findMany({
      where: {
        aiGenerated: true,
        validated: false,
        id: { notIn: inTests },
      },
      include: { topic: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateExercise(id: string, approve: boolean) {
    const exercise = await this.prisma.exercise.findUnique({ where: { id } });
    if (!exercise) {
      throw new NotFoundException(`Exercise with id "${id}" not found`);
    }
    if (!approve) {
      await this.prisma.exercise.delete({ where: { id } });
      return { id, deleted: true };
    }
    return this.prisma.exercise.update({
      where: { id },
      data: { validated: true },
    });
  }

  // ===== EXPERIMENT ARM ASSIGNMENT =====
  async setGroup(studentId: string, group: 'CONTROL' | 'EXPERIMENTAL') {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundException(`Student with id "${studentId}" not found`);
    }
    return this.prisma.user.update({
      where: { id: studentId },
      data: { experimentArm: group },
      select: { id: true, email: true, experimentArm: true },
    });
  }

  // ===== FORMAL TESTS =====
  async createTest(dto: {
    title: string;
    type: 'PRE_TEST' | 'POST_TEST' | 'DELAYED_POST' | 'QUIZ';
    topicIds: string[];
    questionIds: string[];
    durationMin?: number;
  }) {
    if (!dto.questionIds.length) {
      throw new BadRequestException('No questions selected');
    }
    const found = await this.prisma.exercise.count({
      where: { id: { in: dto.questionIds } },
    });
    if (found !== dto.questionIds.length) {
      throw new BadRequestException('Some question ids do not exist');
    }
    return this.prisma.test.create({ data: dto });
  }

  /**
   * AI-generate a test: produce fresh questions for the topic (balanced mix of
   * MC / fill-in / true-false), persist them as test-only exercises
   * (validated:false → never shown in practice, kept out of the pending queue),
   * then assemble them into a new Test in one step.
   */
  async generateTest(dto: GenerateTestDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
    });
    if (!topic) {
      throw new NotFoundException(`Topic "${dto.topicId}" not found`);
    }

    const difficulty = dto.difficulty ?? 3;
    const total = Math.max(1, Math.min(dto.count ?? 9, 50));

    // Distribute the requested count evenly across the three auto-scorable
    // types; the remainder is spread over the first types.
    const TYPES: ExerciseType[] = [
      'MULTIPLE_CHOICE',
      'FILL_IN_BLANK',
      'TRUE_FALSE',
    ];
    const per = Math.floor(total / TYPES.length);
    const counts = TYPES.map(
      (_, i) => per + (i < total % TYPES.length ? 1 : 0),
    );

    const questionIds: string[] = [];
    for (let i = 0; i < TYPES.length; i++) {
      if (counts[i] <= 0) continue;
      const generated = await this.generator.generate({
        topic: topic.title,
        rule: topic.title,
        type: TYPES[i],
        difficulty,
        count: counts[i],
      });
      for (const g of generated) {
        const ex = await this.prisma.exercise.create({
          data: {
            topicId: topic.id,
            type: TYPES[i],
            prompt: g.prompt,
            payload: g.payload as Prisma.InputJsonValue,
            difficulty,
            difficultyLogit: difficultyToLogit(difficulty),
            aiGenerated: true,
            validated: false, // test-only
            order: 0,
          },
        });
        questionIds.push(ex.id);
      }
    }

    if (!questionIds.length) {
      throw new BadRequestException(
        'Generation produced no questions. Please try again.',
      );
    }

    return this.prisma.test.create({
      data: {
        title: dto.title,
        type: dto.type,
        topicIds: [topic.id],
        questionIds,
        durationMin: dto.durationMin,
      },
    });
  }

  async updateTest(
    id: string,
    dto: {
      title?: string;
      type?: 'PRE_TEST' | 'POST_TEST' | 'DELAYED_POST' | 'QUIZ';
      topicIds?: string[];
      questionIds?: string[];
      durationMin?: number;
    },
  ) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!test) throw new NotFoundException(`Test "${id}" not found`);

    if (dto.questionIds) {
      const found = await this.prisma.exercise.count({
        where: { id: { in: dto.questionIds } },
      });
      if (found !== dto.questionIds.length) {
        throw new BadRequestException('Some question ids do not exist');
      }
    }
    return this.prisma.test.update({ where: { id }, data: dto });
  }

  async deleteTest(id: string) {
    const test = await this.prisma.test.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!test) throw new NotFoundException(`Test "${id}" not found`);
    // Remove attempts first (no cascade) then the test itself.
    await this.prisma.testAttempt.deleteMany({ where: { testId: id } });
    await this.prisma.test.delete({ where: { id } });
    return { deleted: true };
  }
}
