import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GroupRow {
  group: string;
  submissions: number;
  accuracy: number | null;
  avg_latency_ms: number | null;
}

export interface HeatmapRow {
  topic: string;
  category: string;
  count: number;
}

export interface CurveRow {
  day: Date;
  accuracy: number;
  attempts: number;
}

export interface Trend {
  value: number;
  prevValue: number;
  trendPct: number | null;
}

function trend(value: number, prevValue: number): Trend {
  const trendPct =
    prevValue > 0 ? Math.round(((value - prevValue) / prevValue) * 1000) / 10 : null;
  return { value, prevValue, trendPct };
}

/** Given [from,to], returns the previous equal-length window. */
function prevWindow(from: Date, to: Date): { pFrom: Date; pTo: Date } {
  const span = to.getTime() - from.getTime();
  return { pFrom: new Date(from.getTime() - span), pTo: new Date(from) };
}

/** FEATURE 5 — research analytics (raw SQL for speed). */
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /** CONTROL vs EXPERIMENTAL comparison. */
  async groupComparison(): Promise<GroupRow[]> {
    return this.prisma.$queryRaw<GroupRow[]>`
      SELECT u."experimentArm"::text AS "group",
             COUNT(s.id)::int AS submissions,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             ROUND(AVG(s."responseTimeMs"))::float AS avg_latency_ms
      FROM submissions s
      JOIN users u ON u.id = s."userId"
      WHERE u.role = 'STUDENT'
      GROUP BY u."experimentArm"
      ORDER BY u."experimentArm";`;
  }

  /** Error heatmap: errorCategory × topic. */
  async errorHeatmap(): Promise<HeatmapRow[]> {
    return this.prisma.$queryRaw<HeatmapRow[]>`
      SELECT t.title AS topic,
             s."errorCategory" AS category,
             COUNT(*)::int AS count
      FROM submissions s
      JOIN users u ON u.id = s."userId"
      JOIN exercises e ON e.id = s."exerciseId"
      JOIN topics t ON t.id = e."topicId"
      WHERE s."isCorrect" = false
        AND s."errorCategory" IS NOT NULL
        AND u.role = 'STUDENT'
      GROUP BY t.title, s."errorCategory"
      ORDER BY count DESC;`;
  }

  /** Per-user learning curve: daily accuracy. */
  async learningCurve(userId: string): Promise<CurveRow[]> {
    return this.prisma.$queryRaw<CurveRow[]>`
      SELECT DATE_TRUNC('day', s."createdAt") AS day,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             COUNT(*)::int AS attempts
      FROM submissions s
      WHERE s."userId" = ${userId}
      GROUP BY day
      ORDER BY day;`;
  }

  /** Class-wide daily timeline: accuracy + submissions over the period. */
  async classTimeline(
    from: Date,
    to: Date,
  ): Promise<{ day: Date; accuracy: number; submissions: number }[]> {
    return this.prisma.$queryRaw<
      { day: Date; accuracy: number; submissions: number }[]
    >`
      SELECT DATE_TRUNC('day', s."createdAt") AS day,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             COUNT(*)::int AS submissions
      FROM submissions s
      JOIN users u ON u.id = s."userId"
      WHERE u.role = 'STUDENT' AND s."createdAt" BETWEEN ${from} AND ${to}
      GROUP BY day
      ORDER BY day;`;
  }

  /** CSV export — consent-gated: only users with consentGivenAt. */
  async exportSubmissionsCsv(): Promise<string> {
    const rows = await this.prisma.$queryRaw<
      {
        userId: string;
        group: string;
        topicId: string;
        isCorrect: boolean;
        responseTimeMs: number | null;
        errorCategory: string | null;
        createdAt: Date;
      }[]
    >`
      SELECT s."userId", u."experimentArm"::text AS "group", e."topicId",
             s."isCorrect", s."responseTimeMs", s."errorCategory", s."createdAt"
      FROM submissions s
      JOIN users u ON u.id = s."userId"
      JOIN exercises e ON e.id = s."exerciseId"
      WHERE u."consentGivenAt" IS NOT NULL
        AND u.role = 'STUDENT'
      ORDER BY s."createdAt";`;

    // Quote only when needed; escape embedded quotes — produces valid CSV.
    const esc = (v: unknown): string => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      'userId',
      'group',
      'topicId',
      'isCorrect',
      'responseTimeMs',
      'errorCategory',
      'createdAt',
    ].join(',');
    const body = rows
      .map((r) =>
        [
          r.userId,
          r.group,
          r.topicId,
          r.isCorrect,
          r.responseTimeMs ?? '',
          r.errorCategory ?? '',
          r.createdAt.toISOString(),
        ]
          .map(esc)
          .join(','),
      )
      .join('\r\n');
    // BOM so Excel opens UTF-8 correctly.
    return `﻿${header}\r\n${body}`;
  }

  // ============= ADVANCED ANALYTICS =============

  /** Global overview with period-over-period trends. */
  async overview(from: Date, to: Date) {
    const { pFrom, pTo } = prevWindow(from, to);

    const windowStats = async (a: Date, b: Date) => {
      const rows = await this.prisma.$queryRaw<
        {
          active: number;
          submissions: number;
          accuracy: number | null;
          latency: number | null;
        }[]
      >`
        SELECT COUNT(DISTINCT s."userId")::int AS active,
               COUNT(s.id)::int AS submissions,
               ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
               ROUND(AVG(s."responseTimeMs"))::float AS latency
        FROM submissions s
        JOIN users u ON u.id = s."userId"
        WHERE u.role = 'STUDENT' AND s."createdAt" BETWEEN ${a} AND ${b};`;
      return rows[0];
    };

    const cur = await windowStats(from, to);
    const prev = await windowStats(pFrom, pTo);

    return {
      activeStudents: trend(cur.active ?? 0, prev.active ?? 0),
      submissions: trend(cur.submissions ?? 0, prev.submissions ?? 0),
      accuracy: trend(cur.accuracy ?? 0, prev.accuracy ?? 0),
      avgLatencyMs: trend(cur.latency ?? 0, prev.latency ?? 0),
    };
  }

  /** Per study-group comparison with trends. */
  async groupsCompare(from: Date, to: Date) {
    const { pFrom, pTo } = prevWindow(from, to);

    const query = (a: Date, b: Date) =>
      this.prisma.$queryRaw<
        {
          groupId: string;
          name: string;
          students: number;
          accuracy: number | null;
          submissions: number;
        }[]
      >`
        SELECT g.id AS "groupId", g.name,
               COUNT(DISTINCT u.id)::int AS students,
               ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
               COUNT(s.id)::int AS submissions
        FROM study_groups g
        LEFT JOIN users u ON u."studyGroupId" = g.id AND u.role = 'STUDENT'
        LEFT JOIN submissions s ON s."userId" = u.id
          AND s."createdAt" BETWEEN ${a} AND ${b}
        GROUP BY g.id, g.name
        ORDER BY g.name;`;

    const [cur, prev] = await Promise.all([
      query(from, to),
      query(pFrom, pTo),
    ]);
    const prevMap = new Map(prev.map((r) => [r.groupId, r]));

    // avg mastery (point-in-time, not windowed)
    const mastery = await this.prisma.$queryRaw<
      { groupId: string; avg: number }[]
    >`
      SELECT u."studyGroupId" AS "groupId",
             ROUND(AVG(tm."masteryPct")::numeric, 1)::float AS avg
      FROM topic_mastery tm
      JOIN users u ON u.id = tm."userId"
      WHERE u."studyGroupId" IS NOT NULL
      GROUP BY u."studyGroupId";`;
    const masteryMap = new Map(mastery.map((r) => [r.groupId, r.avg]));

    return cur.map((r) => ({
      groupId: r.groupId,
      name: r.name,
      students: r.students,
      avgMastery: masteryMap.get(r.groupId) ?? 0,
      submissions: r.submissions,
      accuracy: trend(r.accuracy ?? 0, prevMap.get(r.groupId)?.accuracy ?? 0),
    }));
  }

  /** Detailed group view: stats, weak topics, distribution, at-risk. */
  async groupDetail(groupId: string, from: Date, to: Date) {
    const settings = await this.prisma.groupSettings.findUnique({
      where: { groupId },
    });
    const weakThreshold = settings?.weakThreshold ?? 50;
    const atRiskThreshold = settings?.atRiskThreshold ?? 40;

    // Weak topics: avg mastery across group's students, below threshold
    const topics = await this.prisma.$queryRaw<
      { title: string; slug: string; avg: number }[]
    >`
      SELECT t.title, t.slug, ROUND(AVG(tm."masteryPct")::numeric, 1)::float AS avg
      FROM topic_mastery tm
      JOIN users u ON u.id = tm."userId"
      JOIN topics t ON t.id = tm."topicId"
      WHERE u."studyGroupId" = ${groupId}
      GROUP BY t.title, t.slug
      ORDER BY avg ASC;`;

    // Per-student avg mastery for distribution + at-risk
    const students = await this.prisma.$queryRaw<
      { id: string; email: string; avg: number }[]
    >`
      SELECT u.id, u.email,
             COALESCE(ROUND(AVG(tm."masteryPct")::numeric, 1), 0)::float AS avg
      FROM users u
      LEFT JOIN topic_mastery tm ON tm."userId" = u.id
      WHERE u."studyGroupId" = ${groupId} AND u.role = 'STUDENT'
      GROUP BY u.id, u.email
      ORDER BY avg ASC;`;

    const distribution = [
      { range: '0–25', count: students.filter((s) => s.avg < 25).length },
      {
        range: '25–50',
        count: students.filter((s) => s.avg >= 25 && s.avg < 50).length,
      },
      {
        range: '50–75',
        count: students.filter((s) => s.avg >= 50 && s.avg < 75).length,
      },
      { range: '75–100', count: students.filter((s) => s.avg >= 75).length },
    ];

    const activity = await this.prisma.$queryRaw<CurveRow[]>`
      SELECT DATE_TRUNC('day', s."createdAt") AS day,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             COUNT(*)::int AS attempts
      FROM submissions s
      JOIN users u ON u.id = s."userId"
      WHERE u."studyGroupId" = ${groupId}
        AND s."createdAt" BETWEEN ${from} AND ${to}
      GROUP BY day ORDER BY day;`;

    return {
      weakThreshold,
      atRiskThreshold,
      weakTopics: topics.filter((t) => t.avg < weakThreshold),
      allTopics: topics,
      distribution,
      atRisk: students.filter((s) => s.avg < atRiskThreshold),
      students,
      activity,
    };
  }

  /** Student insight: curve, student-vs-group, skills, errors, latency. */
  async studentInsight(studentId: string, from: Date, to: Date) {
    const student = await this.prisma.user.findUniqueOrThrow({
      where: { id: studentId },
      select: { id: true, email: true, fullName: true, studyGroupId: true },
    });
    const groupId = student.studyGroupId;

    const curve = await this.prisma.$queryRaw<CurveRow[]>`
      SELECT DATE_TRUNC('day', s."createdAt") AS day,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             COUNT(*)::int AS attempts
      FROM submissions s
      WHERE s."userId" = ${studentId}
        AND s."createdAt" BETWEEN ${from} AND ${to}
      GROUP BY day ORDER BY day;`;

    // Student mastery vs group avg per topic
    const vsGroup = await this.prisma.$queryRaw<
      { title: string; student: number; group: number }[]
    >`
      SELECT t.title,
             ROUND(AVG(CASE WHEN tm."userId" = ${studentId} THEN tm."masteryPct" END)::numeric, 1)::float AS student,
             ROUND(AVG(CASE WHEN u."studyGroupId" = ${groupId} THEN tm."masteryPct" END)::numeric, 1)::float AS "group"
      FROM topic_mastery tm
      JOIN users u ON u.id = tm."userId"
      JOIN topics t ON t.id = tm."topicId"
      WHERE tm."userId" = ${studentId} OR u."studyGroupId" = ${groupId}
      GROUP BY t.title
      HAVING AVG(CASE WHEN tm."userId" = ${studentId} THEN tm."masteryPct" END) IS NOT NULL
      ORDER BY t.title;`;

    // Top error categories
    const errors = await this.prisma.$queryRaw<
      { category: string; count: number }[]
    >`
      SELECT s."errorCategory" AS category, COUNT(*)::int AS count
      FROM submissions s
      WHERE s."userId" = ${studentId}
        AND s."isCorrect" = false
        AND s."errorCategory" IS NOT NULL
        AND s."errorCategory" NOT IN ('none', 'unclassified')
      GROUP BY s."errorCategory" ORDER BY count DESC LIMIT 5;`;

    // Latency trend (avg response time by day)
    const latency = await this.prisma.$queryRaw<
      { day: Date; ms: number }[]
    >`
      SELECT DATE_TRUNC('day', s."createdAt") AS day,
             ROUND(AVG(s."responseTimeMs"))::float AS ms
      FROM submissions s
      WHERE s."userId" = ${studentId}
        AND s."responseTimeMs" IS NOT NULL
        AND s."createdAt" BETWEEN ${from} AND ${to}
      GROUP BY day ORDER BY day;`;

    return { student, curve, vsGroup, errors, latency };
  }

  /** Experiment view: CONTROL vs EXPERIMENTAL, with counts for significance
   *  and pre/post/delayed test gains. */
  async experiment(from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      {
        arm: string;
        students: number;
        accuracy: number | null;
        latency: number | null;
        submissions: number;
        correct: number;
      }[]
    >`
      SELECT u."experimentArm"::text AS arm,
             COUNT(DISTINCT u.id)::int AS students,
             ROUND(AVG(CASE WHEN s."isCorrect" THEN 1 ELSE 0 END) * 100, 1)::float AS accuracy,
             ROUND(AVG(s."responseTimeMs"))::float AS latency,
             COUNT(s.id)::int AS submissions,
             COUNT(s.id) FILTER (WHERE s."isCorrect")::int AS correct
      FROM users u
      LEFT JOIN submissions s ON s."userId" = u.id
        AND s."createdAt" BETWEEN ${from} AND ${to}
      WHERE u.role = 'STUDENT'
      GROUP BY u."experimentArm"
      ORDER BY u."experimentArm";`;

    // Avg mastery per arm
    const masteryRows = await this.prisma.$queryRaw<
      { arm: string; mastery: number | null }[]
    >`
      SELECT u."experimentArm"::text AS arm,
             ROUND(AVG(tm."masteryPct")::numeric, 1)::float AS mastery
      FROM users u
      LEFT JOIN topic_mastery tm ON tm."userId" = u.id
      WHERE u.role = 'STUDENT'
      GROUP BY u."experimentArm";`;
    const masteryByArm = new Map(masteryRows.map((r) => [r.arm, r.mastery ?? 0]));

    const arms = rows.map((r) => ({
      ...r,
      mastery: masteryByArm.get(r.arm) ?? 0,
    }));

    // Pre/Post/Delayed test gains per arm (avg score of completed attempts)
    const attempts = await this.prisma.testAttempt.findMany({
      where: { completedAt: { not: null }, user: { role: 'STUDENT' } },
      select: {
        score: true,
        user: { select: { experimentArm: true } },
        test: { select: { type: true } },
      },
    });
    const agg = new Map<string, { sum: number; n: number }>();
    for (const a of attempts) {
      const key = `${a.test.type}|${a.user.experimentArm}`;
      const cur = agg.get(key) ?? { sum: 0, n: 0 };
      cur.sum += a.score;
      cur.n += 1;
      agg.set(key, cur);
    }
    const avg = (type: string, arm: string): number | null => {
      const v = agg.get(`${type}|${arm}`);
      return v && v.n > 0 ? Math.round((v.sum / v.n) * 10) / 10 : null;
    };
    const tests = (['PRE_TEST', 'POST_TEST', 'DELAYED_POST'] as const).map(
      (type) => ({
        type,
        control: avg(type, 'CONTROL'),
        experimental: avg(type, 'EXPERIMENTAL'),
      }),
    );

    return { arms, tests };
  }
}
