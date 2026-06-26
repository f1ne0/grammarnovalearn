/**
 * Full content seed: 18 units, 37 topics, ~150 exercises.
 * Idempotent: topics are upserted by slug, exercises are recreated.
 *
 * Run: npm run seed:full
 */
import { ExerciseType, PrismaClient, Prisma, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { UNITS_1_6 } from "./content/units1-6";
import { UNITS_7_12 } from "./content/units7-12";
import { UNITS_13_18 } from "./content/units13-18";
import { SeedUnit } from "./content/types";

const prisma = new PrismaClient();

const ALL_UNITS: SeedUnit[] = [...UNITS_1_6, ...UNITS_7_12, ...UNITS_13_18];

async function main() {
  console.log("🌱 Full content seed: 18 units...");

  // ===== TEACHER + INVITES (same as basic seed) =====
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@grammar.com" },
    update: {},
    create: {
      email: "teacher@grammar.com",
      password: teacherPassword,
      role: "TEACHER" as Role,
    },
  });

  for (const code of ["LEARN2024", "STUDY2024"]) {
    await prisma.invite.upsert({
      where: { code },
      update: {},
      create: {
        code,
        createdBy: teacher.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ===== UNITS / TOPICS / EXERCISES =====
  let topicCount = 0;
  let exerciseCount = 0;

  for (const unit of ALL_UNITS) {
    for (const topicData of unit.topics) {
      const topic = await prisma.topic.upsert({
        where: { slug: topicData.slug },
        update: {
          title: topicData.title,
          unit: unit.unit,
          order: topicData.order,
          readingText: topicData.readingText,
        },
        create: {
          slug: topicData.slug,
          title: topicData.title,
          unit: unit.unit,
          order: topicData.order,
          readingText: topicData.readingText,
        },
      });
      topicCount++;

      // Recreate exercises (idempotent).
      // NOTE: deletes submissions for these exercises via cascade —
      // fine for seeding, do not run against valuable production data.
      await prisma.exercise.deleteMany({ where: { topicId: topic.id } });

      let order = 1;
      for (const ex of topicData.exercises) {
        await prisma.exercise.create({
          data: {
            topicId: topic.id,
            type: ex.type as ExerciseType,
            prompt: ex.prompt,
            payload: ex.payload as Prisma.InputJsonValue,
            difficulty: ex.difficulty,
            difficultyLogit: (ex.difficulty - 3) * 0.75, // logit scale for adaptivity
            order: order++,
          },
        });
        exerciseCount++;
      }
    }
    console.log(`✅ Unit ${unit.unit}: ${unit.title} (${unit.topics.length} topics)`);
  }

  // ===== WRITING TASKS =====
  const writingTasks = [
    {
      prompt:
        "Describe your typical workday as an IT student or junior developer. Use Present Simple. (50-150 words)",
      minWords: 50,
      maxWords: 150,
    },
    {
      prompt:
        "Write a short incident report: yesterday your team's server went down. What happened and what did you do? Use past tenses. (60-180 words)",
      minWords: 60,
      maxWords: 180,
    },
    {
      prompt:
        "Compare two technologies you know (languages, frameworks, or databases). Which is better and why? Use comparatives and superlatives. (60-180 words)",
      minWords: 60,
      maxWords: 180,
    },
  ];
  const existingTasks = await prisma.writingTask.count();
  if (existingTasks === 0) {
    for (const t of writingTasks) {
      await prisma.writingTask.create({ data: t });
    }
    console.log(`✅ Writing tasks created: ${writingTasks.length}`);
  }

  console.log(`✨ Done: ${topicCount} topics, ${exerciseCount} exercises.`);
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
