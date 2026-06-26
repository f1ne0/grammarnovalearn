import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Student self-service: own progress across all skills + history. */
@Injectable()
export class MeService {
  constructor(private prisma: PrismaService) {}

  async progress(userId: string) {
    const mastery = await this.prisma.topicMastery.findMany({
      where: { userId },
      include: {
        topic: { select: { title: true, slug: true, unit: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const [reading, listening, writing, speaking, grammar] =
      await Promise.all([
        this.prisma.readingSession.aggregate({
          where: { userId, comprehensionScore: { not: null } },
          _avg: { comprehensionScore: true, wpm: true },
          _count: true,
        }),
        this.prisma.listeningSession.aggregate({
          where: { userId, completedAt: { not: null } },
          _avg: { comprehensionScore: true },
          _count: true,
        }),
        this.prisma.writingSubmission.aggregate({
          where: { userId },
          _avg: { grammarScore: true },
          _count: true,
        }),
        this.prisma.speakingSubmission.aggregate({
          where: { submission: { userId } },
          _avg: { totalScore: true },
          _count: true,
        }),
        this.prisma.submission.aggregate({
          where: { userId },
          _count: true,
        }),
      ]);

    const correctCount = await this.prisma.submission.count({
      where: { userId, isCorrect: true },
    });

    return {
      grammar: {
        mastery,
        totalSubmissions: grammar._count,
        accuracy:
          grammar._count > 0
            ? Math.round((correctCount / grammar._count) * 1000) / 10
            : 0,
      },
      skills: {
        reading: {
          avgComprehension: reading._avg.comprehensionScore,
          avgWpm: reading._avg.wpm,
          sessions: reading._count,
        },
        listening: {
          avgComprehension: listening._avg.comprehensionScore,
          sessions: listening._count,
        },
        writing: {
          avgScore: writing._avg.grammarScore,
          count: writing._count,
        },
        speaking: {
          avgScore: speaking._avg.totalScore,
          count: speaking._count,
        },
      },
    };
  }

  /**
   * Study activity for the learner dashboard: a 14-day attempt series,
   * current and best day-streaks, and an accuracy trend (last 7 vs prev 7).
   * All derived from grammar submissions.
   */
  async activity(userId: string) {
    const now = new Date();
    const since = new Date(now);
    since.setDate(since.getDate() - 90);

    const subs = await this.prisma.submission.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { createdAt: true, isCorrect: true },
    });

    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const byDay = new Map<string, { attempts: number; correct: number }>();
    for (const s of subs) {
      const k = dayKey(s.createdAt);
      const cur = byDay.get(k) ?? { attempts: 0, correct: 0 };
      cur.attempts++;
      if (s.isCorrect) cur.correct++;
      byDay.set(k, cur);
    }

    // Last 14 calendar days, gaps filled with zeros (oldest → newest).
    const days: { day: string; attempts: number; correct: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const v = byDay.get(k) ?? { attempts: 0, correct: 0 };
      days.push({ day: k, attempts: v.attempts, correct: v.correct });
    }

    // Current streak: count consecutive active days ending today (an empty
    // today doesn't break it — yesterday still counts).
    const cursor = new Date(now);
    if (!byDay.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let current = 0;
    while (byDay.has(dayKey(cursor))) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    }

    // Best streak across the 90-day window.
    let best = 0;
    let run = 0;
    let prevTime: number | null = null;
    for (const k of [...byDay.keys()].sort()) {
      const t = new Date(k).getTime();
      run = prevTime !== null && t - prevTime === 86400000 ? run + 1 : 1;
      best = Math.max(best, run);
      prevTime = t;
    }

    // Accuracy: last 7 days vs the 7 before that.
    const sum = (arr: typeof days) =>
      arr.reduce(
        (o, d) => ({ a: o.a + d.attempts, c: o.c + d.correct }),
        { a: 0, c: 0 },
      );
    const last7 = sum(days.slice(7));
    const prev7 = sum(days.slice(0, 7));
    const pct = (x: { a: number; c: number }) =>
      x.a > 0 ? Math.round((x.c / x.a) * 1000) / 10 : null;
    const value = pct(last7);
    const prevValue = pct(prev7);
    const trendPct =
      value !== null && prevValue !== null && prevValue > 0
        ? Math.round(((value - prevValue) / prevValue) * 100)
        : null;

    return {
      streak: { current, best },
      days,
      accuracy: { value, prevValue, trendPct },
    };
  }

  async submissions(userId: string, limit = 20, offset = 0) {
    const take = Math.min(Math.max(limit, 1), 100);
    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
        skip: Math.max(offset, 0),
        include: { exercise: { select: { prompt: true, type: true } } },
      }),
      this.prisma.submission.count({ where: { userId } }),
    ]);
    return { items, total, limit: take, offset };
  }

  // Approach 4: topics due for spaced-repetition review (nextReviewAt <= now)
  async reviews(userId: string) {
    const now = new Date();
    const due = await this.prisma.topicMastery.findMany({
      where: { userId, nextReviewAt: { lte: now } },
      orderBy: { nextReviewAt: 'asc' },
      include: {
        topic: { select: { title: true, slug: true, unit: true } },
      },
    });

    const upcoming = await this.prisma.topicMastery.findMany({
      where: { userId, nextReviewAt: { gt: now } },
      orderBy: { nextReviewAt: 'asc' },
      take: 12,
      include: {
        topic: { select: { title: true, slug: true, unit: true } },
      },
    });

    const map = (m: (typeof due)[number]) => ({
      slug: m.topic.slug,
      title: m.topic.title,
      unit: m.topic.unit,
      masteryPct: m.masteryPct,
      state: m.state,
      reviewCount: m.reviewCount,
      nextReviewAt: m.nextReviewAt,
    });

    return {
      dueNow: due.map(map),
      upcoming: upcoming.map(map),
      nextReviewAt: upcoming[0]?.nextReviewAt ?? null,
    };
  }

  async writingHistory(userId: string) {
    return this.prisma.writingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { task: { select: { prompt: true } } },
    });
  }

  async speakingHistory(userId: string) {
    return this.prisma.speakingSubmission.findMany({
      where: { submission: { userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        submission: {
          select: {
            exercise: { select: { prompt: true } },
            createdAt: true,
          },
        },
      },
    });
  }
}
