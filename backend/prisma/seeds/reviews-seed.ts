/**
 * Reviews demo seed: populates the student "Reviews" page (spaced repetition)
 * for a single student so it looks alive in demos / dissertation screenshots.
 *
 * Creates per-topic mastery rows with review dates: a few DUE NOW (date in the
 * past) and several COMING UP (dates at the canonical 1 / 3 / 7 / 16 / 35-day
 * intervals). Also seeds matching per-exercise review items so the
 * "Tracked topics" stat is non-zero.
 *
 * Idempotent — safe to run multiple times.
 *
 * Target student: demo1@student.com (override with TARGET_EMAIL env var).
 * Run AFTER the content + demo seeds exist:  npm run seed:reviews
 */
import { MasteryState, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TARGET_EMAIL = process.env.TARGET_EMAIL ?? "demo1@student.com";

const daysFromNow = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date;
};

// offset(days), mastery%, state, reviewCount
const PLAN: {
  offset: number;
  pct: number;
  state: MasteryState;
  reviewCount: number;
}[] = [
  // ---- DUE NOW (nextReviewAt in the past / today) ----
  { offset: -2, pct: 88, state: "MASTERED", reviewCount: 3 },
  { offset: -1, pct: 82, state: "PRACTICED", reviewCount: 2 },
  { offset: 0, pct: 91, state: "MASTERED", reviewCount: 4 },
  // ---- COMING UP (canonical SM-2 intervals) ----
  { offset: 1, pct: 79, state: "PRACTICED", reviewCount: 1 },
  { offset: 3, pct: 85, state: "MASTERED", reviewCount: 2 },
  { offset: 7, pct: 90, state: "MASTERED", reviewCount: 3 },
  { offset: 16, pct: 94, state: "MASTERED", reviewCount: 4 },
  { offset: 35, pct: 96, state: "MASTERED", reviewCount: 5 },
];

async function main() {
  console.log(`🔁 Reviews seed for ${TARGET_EMAIL} ...`);

  let user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    console.warn(
      `⚠️  ${TARGET_EMAIL} not found — falling back to the first STUDENT.`,
    );
    user = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  }
  if (!user) {
    throw new Error(
      "No student found. Run `npm run seed:demo` first to create students.",
    );
  }

  // Need at least as many topics as the plan, in unit order.
  const topics = await prisma.topic.findMany({
    orderBy: [{ unit: "asc" }, { order: "asc" }],
    take: PLAN.length,
    select: { id: true, title: true, unit: true },
  });
  if (topics.length === 0) {
    throw new Error(
      "No topics found. Run `npm run seed` / `npm run seed:full` first.",
    );
  }

  let dueNow = 0;
  let upcoming = 0;

  for (let i = 0; i < topics.length && i < PLAN.length; i++) {
    const topic = topics[i];
    const p = PLAN[i];
    const nextReviewAt = daysFromNow(p.offset);
    if (p.offset <= 0) dueNow++;
    else upcoming++;

    const attempts = 8 + p.reviewCount * 2;
    const correct = Math.round((p.pct / 100) * attempts);

    // Per-topic mastery — drives the Reviews page (Due now / Coming up).
    await prisma.topicMastery.upsert({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      update: {
        masteryPct: p.pct,
        state: p.state,
        nextReviewAt,
        reviewCount: p.reviewCount,
        attempts,
        correct,
      },
      create: {
        userId: user.id,
        topicId: topic.id,
        masteryPct: p.pct,
        abilityEstimate: (p.pct / 100 - 0.5) * 2,
        state: p.state,
        nextReviewAt,
        reviewCount: p.reviewCount,
        attempts,
        correct,
      },
    });

    // Per-exercise review items — feed the "Tracked topics" stat (/review/stats).
    const exercises = await prisma.exercise.findMany({
      where: { topicId: topic.id },
      take: 3,
      select: { id: true },
    });
    for (const ex of exercises) {
      await prisma.reviewItem.upsert({
        where: {
          userId_exerciseId: { userId: user.id, exerciseId: ex.id },
        },
        update: {
          nextReviewDate: nextReviewAt,
          lastReviewDate: daysFromNow(p.offset - 7),
          interval: Math.max(1, p.offset),
          repetitions: p.reviewCount,
          quality: p.pct >= 85 ? 5 : 4,
        },
        create: {
          userId: user.id,
          exerciseId: ex.id,
          nextReviewDate: nextReviewAt,
          lastReviewDate: daysFromNow(p.offset - 7),
          interval: Math.max(1, p.offset),
          easeFactor: 2.5,
          repetitions: p.reviewCount,
          quality: p.pct >= 85 ? 5 : 4,
        },
      });
    }
  }

  console.log(
    `✅ Done. ${topics.length} topics seeded for ${user.email} — ` +
      `${dueNow} due now, ${upcoming} coming up.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
