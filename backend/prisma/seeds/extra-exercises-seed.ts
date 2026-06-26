/**
 * Approach 2 — seed additional deterministic exercise types (ось B).
 * Adds new cognitive-mode drills to existing topics. Additive & idempotent:
 * removes only the new-type exercises it owns, then reinserts.
 * Run AFTER seed:full →  npm run seed:extra-exercises
 */
import { ExerciseType, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ExtraExercise {
  type: ExerciseType;
  prompt: string;
  payload: Record<string, unknown>;
  difficulty: number;
}

// Keyed by topic slug
const EXTRA: Record<string, ExtraExercise[]> = {
  "present-simple": [
    {
      // RECALL — type the word, no options
      type: "OPEN_CLOZE",
      prompt: "Type the missing word. (recall)",
      payload: {
        text: "A backend developer _____ APIs for the mobile team.",
        correctAnswers: ["builds", "writes", "creates", "develops"],
        explanation:
          "3rd person singular (a developer = he/she) adds -s: builds.",
      },
      difficulty: 2,
    },
    {
      // PRODUCE — form the right word from a root
      type: "WORD_FORMATION",
      prompt: "Use the word in CAPITALS to complete the sentence. (produce)",
      payload: {
        text: "Our CI pipeline runs _____ on every push. (AUTOMATIC)",
        root: "AUTOMATIC",
        correctAnswers: ["automatically"],
        explanation: "Adverb of manner: automatic → automatically.",
      },
      difficulty: 3,
    },
    {
      // TRANSFORM — rewrite using a key word
      type: "KEY_WORD_TRANSFORMATION",
      prompt:
        "Complete the second sentence so it means the same, using the key word. (transform)",
      payload: {
        original: "She is responsible for testing the build every day.",
        keyword: "TESTS",
        prompt2: "She _____ the build every day.",
        correctAnswers: ["tests"],
        explanation:
          "Turn the noun phrase into a Present Simple verb: tests.",
      },
      difficulty: 3,
    },
    {
      // CORRECT — fix the wrong word
      type: "ERROR_CORRECTION",
      prompt: "One word is wrong. Type the corrected sentence. (correct)",
      payload: {
        text: "A senior engineer review every pull request.",
        errors: [{ wrong: "review", right: "reviews" }],
        correctAnswers: ["A senior engineer reviews every pull request."],
        explanation: "Subject 'a senior engineer' is singular → reviews.",
      },
      difficulty: 2,
    },
    {
      // RECOGNISE — sort items into buckets
      type: "CATEGORIZE",
      prompt: "Sort the verb forms by subject. (recognise)",
      payload: {
        items: [
          { id: "i1", text: "works" },
          { id: "i2", text: "work" },
          { id: "i3", text: "deploys" },
          { id: "i4", text: "deploy" },
        ],
        categories: [
          { id: "sg", label: "he / she / it" },
          { id: "pl", label: "I / you / we / they" },
        ],
        answer: { i1: "sg", i2: "pl", i3: "sg", i4: "pl" },
        explanation: "Singular subjects take -s; plural subjects use the base.",
      },
      difficulty: 1,
    },
  ],

  "past-simple": [
    {
      type: "OPEN_CLOZE",
      prompt: "Type the Past Simple form. (recall)",
      payload: {
        text: "Yesterday the team _____ (ship) the new release.",
        correctAnswers: ["shipped"],
        explanation: "Regular verb: ship → shipped.",
      },
      difficulty: 2,
    },
    {
      type: "ERROR_CORRECTION",
      prompt: "Fix the verb. Type the corrected sentence. (correct)",
      payload: {
        text: "We didn't deployed the hotfix on Friday.",
        errors: [{ wrong: "deployed", right: "deploy" }],
        correctAnswers: ["We didn't deploy the hotfix on Friday."],
        explanation: "After did/didn't use the base verb: deploy.",
      },
      difficulty: 2,
    },
  ],
};

const NEW_TYPES: ExerciseType[] = [
  "OPEN_CLOZE",
  "WORD_FORMATION",
  "KEY_WORD_TRANSFORMATION",
  "ERROR_CORRECTION",
  "CATEGORIZE",
];

async function main() {
  console.log("🌱 Seeding extra exercise types (ось B)...");
  let total = 0;

  for (const [slug, list] of Object.entries(EXTRA)) {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) {
      console.warn(`  ⚠️ topic "${slug}" not found — skipping`);
      continue;
    }

    // Idempotent: remove only the new-type exercises we own
    await prisma.exercise.deleteMany({
      where: { topicId: topic.id, type: { in: NEW_TYPES } },
    });

    // Continue order after existing exercises
    const maxOrder = await prisma.exercise.aggregate({
      where: { topicId: topic.id },
      _max: { order: true },
    });
    let order = (maxOrder._max.order ?? 0) + 1;

    for (const ex of list) {
      await prisma.exercise.create({
        data: {
          topicId: topic.id,
          type: ex.type,
          prompt: ex.prompt,
          payload: ex.payload as Prisma.InputJsonValue,
          difficulty: ex.difficulty,
          difficultyLogit: (ex.difficulty - 3) * 0.75,
          order: order++,
        },
      });
      total++;
    }
    console.log(`  ✅ ${slug}: +${list.length} exercises`);
  }

  console.log(`✨ Done: ${total} extra exercises.`);
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
