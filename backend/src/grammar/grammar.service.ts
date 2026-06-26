import { Injectable, NotFoundException } from '@nestjs/common';
import { MasteryState } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GradingService } from './grading.service';
import { EventsService } from '../events/events.service';

/**
 * Approach 3 — grammar as a standalone track.
 * Pure read-over: composes existing Topic / Exercise / TopicMastery / PresentationBlock.
 * Approach 5 — knowledge check writes a mastery verdict + review schedule.
 */
@Injectable()
export class GrammarService {
  constructor(
    private prisma: PrismaService,
    private grading: GradingService,
    private events: EventsService,
  ) {}

  private static readonly SR_INTERVALS = [1, 3, 7, 16, 35];

  // ===== Approach 5: knowledge check =====

  /** Questions for the topic's check (answers stripped). */
  async knowledgeCheck(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);

    const exercises = await this.prisma.exercise.findMany({
      where: {
        topicId: topic.id,
        type: { not: 'SPEAKING' },
        validated: true,
      },
      orderBy: { order: 'asc' },
      select: { id: true, type: true, prompt: true, payload: true },
      take: 6,
    });

    const questions = exercises.map((e) => ({
      id: e.id,
      type: e.type,
      prompt: e.prompt,
      payload: this.stripAnswers(e.payload as Record<string, unknown>),
    }));

    return { topic: { title: topic.title }, questions };
  }

  /** Grade the check, write a mastery verdict, schedule next review. */
  async submitKnowledgeCheck(
    slug: string,
    userId: string,
    answers: { exerciseId: string; answer: Record<string, unknown> }[],
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);

    const exercises = await this.prisma.exercise.findMany({
      where: { id: { in: answers.map((a) => a.exerciseId) } },
      select: { id: true, type: true, payload: true },
    });
    const byId = new Map(exercises.map((e) => [e.id, e]));

    let correct = 0;
    const detailed = answers.map((a) => {
      const ex = byId.get(a.exerciseId);
      const isCorrect = ex
        ? this.grading.check(
            ex.type,
            ex.payload as Record<string, unknown>,
            a.answer,
          )
        : false;
      if (isCorrect) correct++;
      return { exerciseId: a.exerciseId, isCorrect };
    });

    const total = answers.length;
    const scorePct = total > 0 ? (correct / total) * 100 : 0;
    const passed = scorePct >= 75;

    // Write verdict to TopicMastery (state + schedule)
    const existing = await this.prisma.topicMastery.findUnique({
      where: { userId_topicId: { userId, topicId: topic.id } },
    });
    const reviewCount = existing?.reviewCount ?? 0;

    let state: MasteryState;
    let nextReviewAt: Date | null = null;
    let newReviewCount = reviewCount;

    if (passed) {
      state = 'MASTERED';
      const interval =
        GrammarService.SR_INTERVALS[
          Math.min(reviewCount, GrammarService.SR_INTERVALS.length - 1)
        ];
      nextReviewAt = this.daysFromNow(interval);
      newReviewCount = reviewCount + 1;
    } else {
      state = scorePct >= 50 ? 'PRACTICED' : 'LEARNING';
    }

    await this.prisma.topicMastery.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      update: { state, nextReviewAt, reviewCount: newReviewCount },
      create: {
        userId,
        topicId: topic.id,
        attempts: total,
        correct,
        masteryPct: scorePct,
        state,
        nextReviewAt,
        reviewCount: newReviewCount,
      },
    });

    this.events.log(userId, 'knowledge_check', {
      topicId: topic.id,
      scorePct,
      passed,
    });

    return {
      score: Math.round(scorePct),
      correct,
      total,
      passed,
      verdict: passed ? 'MASTERED' : 'needs practice',
      nextReviewAt,
      detailed,
    };
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
      answer: _f,
      explanation: _g,
      errors: _h,
      ...rest
    } = payload;
    return rest;
  }

  private daysFromNow(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  /** Library: units → topics with the student's mastery and lock state. */
  async library(userId?: string) {
    const topics = await this.prisma.topic.findMany({
      orderBy: [{ unit: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        unit: true,
        order: true,
        _count: { select: { exercises: true, presentations: true } },
      },
    });

    const masteryMap = new Map<string, number>();
    const stateMap = new Map<string, string>();
    if (userId) {
      const mastery = await this.prisma.topicMastery.findMany({
        where: { userId },
        select: { topicId: true, masteryPct: true, state: true },
      });
      for (const m of mastery) {
        masteryMap.set(m.topicId, m.masteryPct);
        stateMap.set(m.topicId, m.state);
      }
    }

    // Group by unit, compute per-topic state. A topic is "available" if the
    // previous topic in the same unit is started; first topic always available.
    const byUnit = new Map<number, typeof topics>();
    for (const t of topics) {
      const list = byUnit.get(t.unit) ?? [];
      list.push(t);
      byUnit.set(t.unit, list);
    }

    const units = [...byUnit.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([unit, list]) => {
        const sorted = list.sort((a, b) => a.order - b.order);
        let prevStarted = true; // first topic of each unit is available
        const mapped = sorted.map((t) => {
          const pct = masteryMap.get(t.id) ?? 0;
          const dbState = stateMap.get(t.id);
          const state =
            dbState === 'MASTERED'
              ? 'mastered'
              : pct > 0 || dbState === 'LEARNING' || dbState === 'PRACTICED'
                ? 'current'
                : prevStarted
                  ? 'available'
                  : 'locked';
          prevStarted = pct > 0 || !!dbState;
          return {
            id: t.id,
            slug: t.slug,
            title: t.title,
            order: t.order,
            exerciseCount: t._count.exercises,
            hasPresentation: t._count.presentations > 0,
            masteryPct: pct,
            state,
          };
        });
        const avg =
          mapped.reduce((s, m) => s + m.masteryPct, 0) /
          Math.max(mapped.length, 1);
        return { unit, avgMastery: Math.round(avg), topics: mapped };
      });

    return { units };
  }

  /** Topic reference: presentation blocks + meta + mastery. */
  async reference(slug: string, userId?: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        unit: true,
        readingText: true,
        presentations: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            mode: true,
            order: true,
            contentMd: true,
            payload: true,
          },
        },
        _count: { select: { exercises: true } },
      },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);

    let masteryPct = 0;
    if (userId) {
      const m = await this.prisma.topicMastery.findUnique({
        where: { userId_topicId: { userId, topicId: topic.id } },
        select: { masteryPct: true },
      });
      masteryPct = m?.masteryPct ?? 0;
    }

    return { ...topic, masteryPct };
  }

  /** Adaptive drill set: pick n deterministic exercises near the user's level. */
  async drills(slug: string, userId: string, n = 10) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);

    const mastery = await this.prisma.topicMastery.findUnique({
      where: { userId_topicId: { userId, topicId: topic.id } },
      select: { abilityEstimate: true },
    });
    const ability = mastery?.abilityEstimate ?? 0;

    // Deterministic types only (no AI / speaking)
    const exercises = await this.prisma.exercise.findMany({
      where: {
        topicId: topic.id,
        type: { not: 'SPEAKING' },
        validated: true,
      },
      select: {
        id: true,
        type: true,
        prompt: true,
        payload: true,
        difficulty: true,
        difficultyLogit: true,
      },
    });

    // Sort by closeness to ability, take n
    return exercises
      .sort(
        (a, b) =>
          Math.abs(a.difficultyLogit - ability) -
          Math.abs(b.difficultyLogit - ability),
      )
      .slice(0, n);
  }
}
