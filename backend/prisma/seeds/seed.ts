import { ExerciseType, PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ===== CREATE TEACHER =====
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

  console.log("✅ Teacher created:", teacher.email);

  // ===== CREATE UNIT 1 TOPICS =====
  const topics = [
    {
      slug: "present-simple",
      title: "Present Simple Tense",
      unit: 1,
      order: 1,
      readingText: `
A software developer works for a technology company.
She designs applications for mobile devices.
Every day, she codes, tests, and debugs software.
She also communicates with her team about project requirements.
      `.trim(),
    },
    {
      slug: "nouns-plural",
      title: "Singular and Plural Nouns",
      unit: 1,
      order: 2,
      readingText: `
In an IT department, there are many computers and servers.
Software developers use keyboards and mice.
They work with databases and applications.
Teams include specialists in different areas.
      `.trim(),
    },
    {
      slug: "personality-adjectives",
      title: "Personality Adjectives in IT",
      unit: 1,
      order: 3,
      readingText: `
Good software developers are responsible and creative.
They must be organized, patient, and hardworking.
Communication skills are important for team members.
Successful teams have dedicated and motivated professionals.
      `.trim(),
    },
  ];

  const createdTopics = await Promise.all(
    topics.map((topic) =>
      prisma.topic.upsert({
        where: { slug: topic.slug },
        update: topic,
        create: topic,
      }),
    ),
  );

  console.log("✅ Topics created:", createdTopics.length);

  // ===== CREATE EXERCISES FOR PRESENT SIMPLE =====
  const presentSimpleTopic = createdTopics[0];

  // idempotent: clear old exercises for this topic first
  await prisma.exercise.deleteMany({
    where: { topicId: presentSimpleTopic.id },
  });

  const presentSimpleExercises = [
    {
      topicId: presentSimpleTopic.id,
      type: "MULTIPLE_CHOICE" as ExerciseType,
      prompt: "A software developer _____ (work) for a technology company.",
      payload: {
        options: [
          { id: "a", text: "work" },
          { id: "b", text: "works" },
          { id: "c", text: "is working" },
          { id: "d", text: "working" },
        ],
        correctAnswerId: "b",
        explanation:
          'We use Present Simple for habitual or general truths. With "he/she/it", we add -s to the verb.',
      },
      difficulty: 1,
      order: 1,
    },
    {
      topicId: presentSimpleTopic.id,
      type: "MULTIPLE_CHOICE" as ExerciseType,
      prompt: "Every day, she _____ (code), (test), and (debug) software.",
      payload: {
        options: [
          { id: "a", text: "code, tests, debugs" },
          { id: "b", text: "codes, test, debug" },
          { id: "c", text: "codes, tests, debugs" },
          { id: "d", text: "coding, testing, debugging" },
        ],
        correctAnswerId: "c",
        explanation:
          'All verbs in the same sentence should have consistent form with the subject "she".',
      },
      difficulty: 2,
      order: 2,
    },
    {
      topicId: presentSimpleTopic.id,
      type: "FILL_IN_BLANK" as ExerciseType,
      prompt: "Software developers _____ with databases and applications.",
      payload: {
        text: "Software developers _____ with databases and applications.",
        correctAnswers: ["work", "work together"],
        explanation: 'Present Simple with plural subject "developers".',
      },
      difficulty: 1,
      order: 3,
    },
    {
      topicId: presentSimpleTopic.id,
      type: "SPEAKING" as ExerciseType,
      prompt:
        "Describe your typical workday as an IT student or developer. Use at least 4 sentences in Present Simple.",
      payload: {
        example:
          "I wake up at 7 am and check my emails. I study programming every morning. In the afternoon, I work on my projects. I usually finish my day by reading tech articles.",
        explanation:
          "Use Present Simple for daily routines and habitual actions.",
      },
      difficulty: 2,
      order: 4,
    },
  ];

  await Promise.all(
    presentSimpleExercises.map((exercise) =>
      prisma.exercise.create({ data: exercise }),
    ),
  );

  console.log("✅ Exercises created:", presentSimpleExercises.length);

  // ===== CREATE INVITE CODES =====
  const inviteCodes = ["LEARN2024", "STUDY2024"];
  for (const code of inviteCodes) {
    await prisma.invite.upsert({
      where: { code },
      update: {},
      create: {
        code,
        createdBy: teacher.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }

  console.log("✅ Invite codes created:", inviteCodes);
  console.log("✨ Seeding completed!");
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
