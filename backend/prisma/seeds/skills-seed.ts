/**
 * Skill-practice demo seed: fills Reading / Listening / Writing / Speaking
 * activity for one student so the Practice page, Goals breakdown and skill
 * stats show real numbers (the base demo seed only creates grammar activity).
 *
 * Idempotent — clears this user's skill data first, then reinserts.
 *
 * Target: demo1@student.com (override with TARGET_EMAIL). Run after seed:full + seed:demo.
 *   npm run seed:skills
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TARGET_EMAIL = process.env.TARGET_EMAIL ?? "demo1@student.com";

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() - d);
  return x;
};

async function main() {
  console.log(`🎧 Skills seed for ${TARGET_EMAIL} ...`);

  let user = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (!user) {
    user = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  }
  if (!user) throw new Error("No student found. Run seed:demo first.");
  const uid = user.id;

  const topics = await prisma.topic.findMany({
    orderBy: [{ unit: "asc" }, { order: "asc" }],
    take: 6,
    select: { id: true },
  });
  if (topics.length === 0) throw new Error("No topics. Run seed:full first.");

  // ---- clear previous skill data for this user (idempotent) ----
  await prisma.readingSession.deleteMany({ where: { userId: uid } });
  await prisma.listeningSession.deleteMany({ where: { userId: uid } });
  await prisma.writingSubmission.deleteMany({ where: { userId: uid } });
  // Speaking submissions cascade when their parent Submission is removed.
  await prisma.submission.deleteMany({
    where: { userId: uid, exercise: { type: "SPEAKING" } },
  });

  // ---- Reading sessions ----
  let reading = 0;
  for (let i = 0; i < 5; i++) {
    const t = topics[i % topics.length];
    await prisma.readingSession.create({
      data: {
        userId: uid,
        topicId: t.id,
        startedAt: daysAgo(rand(1, 20)),
        completedAt: daysAgo(rand(0, 20)),
        readingTimeMs: rand(40000, 90000),
        wpm: rand(110, 185),
        comprehensionScore: rand(60, 95),
      },
    });
    reading++;
  }

  // ---- Listening sessions ----
  let listening = 0;
  for (let i = 0; i < 4; i++) {
    const t = topics[i % topics.length];
    await prisma.listeningSession.create({
      data: {
        userId: uid,
        topicId: t.id,
        playCount: rand(1, 3),
        playbackSpeed: 1.0,
        startedAt: daysAgo(rand(1, 18)),
        completedAt: daysAgo(rand(0, 18)),
        comprehensionScore: rand(55, 92),
      },
    });
    listening++;
  }

  // ---- Writing submissions ----
  let writing = 0;
  const tasks = await prisma.writingTask.findMany({ take: 4, select: { id: true } });
  for (let i = 0; i < tasks.length && i < 3; i++) {
    await prisma.writingSubmission.create({
      data: {
        userId: uid,
        writingTaskId: tasks[i].id,
        text: "I work as a junior developer. Every day I write code, review pull requests, and test new features with my team.",
        wordCount: rand(60, 140),
        errors: [],
        overallFeedback:
          "Good use of Present Simple. Watch article usage and subject-verb agreement.",
        grammarScore: rand(65, 92),
        responseTimeMs: rand(120000, 300000),
        createdAt: daysAgo(rand(0, 16)),
      },
    });
    writing++;
  }

  // ---- Speaking submissions (need a parent Submission) ----
  let speaking = 0;
  const speakEx = await prisma.exercise.findMany({
    where: { type: "SPEAKING" },
    take: 3,
    select: { id: true },
  });
  for (const ex of speakEx) {
    const clarity = rand(3, 5);
    const grammar = rand(3, 5);
    const pace = rand(3, 5);
    const sub = await prisma.submission.create({
      data: {
        userId: uid,
        exerciseId: ex.id,
        answer: { kind: "speaking" },
        isCorrect: true,
        feedback: "Good spoken response — clear and on topic.",
        feedbackType: "metalinguistic",
        createdAt: daysAgo(rand(0, 14)),
      },
    });
    await prisma.speakingSubmission.create({
      data: {
        submissionId: sub.id,
        audioR2Key: `demo/${uid}/${ex.id}.webm`,
        transcript:
          "In my daily work I usually attend the stand-up meeting and then start coding.",
        clarity,
        grammar,
        pace,
        totalScore: Number(((clarity + grammar + pace) / 3).toFixed(2)),
        detailedFeedback:
          "Clear pronunciation and steady pace. Try to use more varied connectors.",
        createdAt: daysAgo(rand(0, 14)),
      },
    });
    speaking++;
  }

  console.log(
    `✅ ${user.email}: reading ${reading}, listening ${listening}, writing ${writing}, speaking ${speaking}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
