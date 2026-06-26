/**
 * Demo seed: ~15 students split CONTROL/EXPERIMENTAL with ~300 synthetic
 * submissions spread over the last 14 days, so analytics (group comparison,
 * error heatmap, learning curves) look alive on day one.
 *
 * Also creates a PRE_TEST and a QUIZ from Unit 1 exercises.
 *
 * Run AFTER `npm run seed:full`:  npm run seed:demo
 */
import { ExperimentArm, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ERROR_CATEGORIES = [
  "tense",
  "article",
  "agreement",
  "preposition",
  "word-order",
  "other",
];

const DEMO_GROUPS = [
  { name: "Group 301 — IT-A", unlockedUnits: [1, 2, 3, 4, 5, 6] },
  { name: "Group 302 — IT-B", unlockedUnits: [1, 2, 3, 4] },
  { name: "Group 303 — Evening", unlockedUnits: [1, 2, 3, 4, 5, 6] },
];

const ACTIVITY_DAYS = 28; // spread over ~4 weeks

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log("🎭 Demo seed: groups + students + synthetic activity...");

  // ===== STUDY GROUPS =====
  // Reset previous demo groups
  await prisma.studyGroup.deleteMany({
    where: { name: { startsWith: "Group 30" } },
  });
  const groups: { id: string; baseAccuracy: number }[] = [];
  for (let i = 0; i < DEMO_GROUPS.length; i++) {
    const g = DEMO_GROUPS[i];
    const group = await prisma.studyGroup.create({
      data: {
        name: g.name,
        settings: {
          create: {
            unlockedUnits: g.unlockedUnits,
            weakThreshold: 50,
            atRiskThreshold: 40,
          },
        },
      },
    });
    // Group 302 is intentionally the weaker cohort (for the demo story)
    groups.push({ id: group.id, baseAccuracy: i === 1 ? 0.48 : 0.58 });
  }
  console.log(`✅ Study groups: ${groups.length}`);

  // ===== STUDENTS =====
  const password = await bcrypt.hash("student123", 10);
  const students: {
    id: string;
    arm: ExperimentArm;
    baseAccuracy: number;
  }[] = [];

  for (let i = 1; i <= 15; i++) {
    const arm: ExperimentArm = i % 2 === 0 ? "CONTROL" : "EXPERIMENTAL";
    const group = groups[i % groups.length];
    const user = await prisma.user.upsert({
      where: { email: `demo${i}@student.com` },
      update: { experimentArm: arm, studyGroupId: group.id },
      create: {
        email: `demo${i}@student.com`,
        password,
        role: "STUDENT",
        experimentArm: arm,
        studyGroupId: group.id,
        fullName: `Demo Student ${i}`,
        consentGivenAt: new Date(),
        createdAt: new Date(Date.now() - (ACTIVITY_DAYS + 2) * 24 * 3600 * 1000),
      },
    });
    students.push({ id: user.id, arm, baseAccuracy: group.baseAccuracy });
  }
  console.log(`✅ Students: ${students.length}`);

  // ===== EXERCISES POOL (non-speaking, units 1-6) =====
  const exercises = await prisma.exercise.findMany({
    where: {
      type: { not: "SPEAKING" },
      topic: { unit: { lte: 6 } },
    },
    select: { id: true, topicId: true, payload: true, type: true },
  });
  if (exercises.length === 0) {
    throw new Error("No exercises found — run `npm run seed:full` first");
  }

  // Clear previous demo submissions (idempotent-ish)
  await prisma.submission.deleteMany({
    where: { user: { email: { startsWith: "demo" } } },
  });
  await prisma.topicMastery.deleteMany({
    where: { user: { email: { startsWith: "demo" } } },
  });

  // ===== SYNTHETIC SUBMISSIONS =====
  let total = 0;
  for (const student of students) {
    const count = rand(28, 45); // ~500 total across 15 students over 4 weeks
    // experiment effect: EXPERIMENTAL starts a bit higher
    const armBoost = student.arm === "EXPERIMENTAL" ? 0.07 : 0;
    const baseAccuracy = student.baseAccuracy + armBoost;

    // mastery accumulators
    const mastery = new Map<string, { attempts: number; correct: number }>();

    for (let k = 0; k < count; k++) {
      const ex = pick(exercises);
      const daysAgo = rand(0, ACTIVITY_DAYS - 1);
      // learning effect: accuracy improves over time, EXPERIMENTAL faster
      const improvement =
        ((ACTIVITY_DAYS - 1 - daysAgo) / (ACTIVITY_DAYS - 1)) *
        (student.arm === "EXPERIMENTAL" ? 0.3 : 0.15);
      const isCorrect = Math.random() < baseAccuracy + improvement;

      const createdAt = new Date(
        Date.now() -
          daysAgo * 24 * 3600 * 1000 -
          rand(0, 12) * 3600 * 1000,
      );

      const errorCategory = isCorrect ? "none" : pick(ERROR_CATEGORIES);
      const feedbackType =
        student.arm === "EXPERIMENTAL" ? "metalinguistic" : "minimal";
      // latency falls over time (skill automation)
      const latencyBase = 18000 - (ACTIVITY_DAYS - daysAgo) * 250;

      await prisma.submission.create({
        data: {
          userId: student.id,
          exerciseId: ex.id,
          answer: { demo: true },
          isCorrect,
          feedback: isCorrect
            ? "Correct."
            : `Incorrect — ${errorCategory} error.`,
          feedbackType,
          errorCategory,
          responseTimeMs: Math.max(2500, latencyBase + rand(-3000, 3000)),
          createdAt,
        },
      });

      const m = mastery.get(ex.topicId) ?? { attempts: 0, correct: 0 };
      m.attempts += 1;
      if (isCorrect) m.correct += 1;
      mastery.set(ex.topicId, m);
      total++;
    }

    for (const [topicId, m] of mastery) {
      const pct = (m.correct / m.attempts) * 100;
      await prisma.topicMastery.create({
        data: {
          userId: student.id,
          topicId,
          attempts: m.attempts,
          correct: m.correct,
          masteryPct: pct,
          abilityEstimate: (m.correct / m.attempts - 0.5) * 2,
        },
      });
    }
  }
  console.log(`✅ Submissions: ${total}`);

  // ===== TESTS (pre-test + quiz from Unit 1) =====
  const unit1Exercises = await prisma.exercise.findMany({
    where: { type: { not: "SPEAKING" }, topic: { unit: 1 } },
    select: { id: true, topicId: true },
    take: 8,
  });
  const topicIds = [...new Set(unit1Exercises.map((e) => e.topicId))];

  // Refresh the seeded tests every run so their questionIds always point at
  // the CURRENT exercises. (Re-running seed:full recreates exercises with new
  // ids, which would otherwise orphan these tests → "0 questions".)
  const seededTitles = ["Placement Test — Unit 1", "Unit 1 Grammar Quiz"];
  const stale = await prisma.test.findMany({
    where: { title: { in: seededTitles } },
    select: { id: true },
  });
  if (stale.length > 0) {
    const ids = stale.map((t) => t.id);
    await prisma.testAttempt.deleteMany({ where: { testId: { in: ids } } });
    await prisma.test.deleteMany({ where: { id: { in: ids } } });
  }
  if (unit1Exercises.length >= 5) {
    await prisma.test.create({
      data: {
        title: "Placement Test — Unit 1",
        type: "PRE_TEST",
        topicIds,
        questionIds: unit1Exercises.slice(0, 5).map((e) => e.id),
        durationMin: 10,
      },
    });
    await prisma.test.create({
      data: {
        title: "Unit 1 Grammar Quiz",
        type: "QUIZ",
        topicIds,
        questionIds: unit1Exercises.slice(0, 8).map((e) => e.id),
        durationMin: 15,
      },
    });
    console.log("✅ Tests refreshed: PRE_TEST + QUIZ");
  }

  console.log("✨ Demo seed completed!");
  console.log("   Students: demo1..demo15@student.com / student123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
