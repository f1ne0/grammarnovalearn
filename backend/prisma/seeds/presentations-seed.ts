/**
 * Approach 1 — seed multi-mode presentation blocks.
 * Additive & idempotent: clears + reinserts blocks for known topics only.
 * Run AFTER seed:full →  npm run seed:presentations
 */
import { PrismaClient, Prisma, PresentationMode } from "@prisma/client";
import { PRESENTATIONS } from "./content/presentations";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding presentation blocks (ось A)...");
  let total = 0;

  for (const [slug, blocks] of Object.entries(PRESENTATIONS)) {
    const topic = await prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) {
      console.warn(`  ⚠️ topic "${slug}" not found — skipping`);
      continue;
    }

    await prisma.presentationBlock.deleteMany({ where: { topicId: topic.id } });

    let order = 1;
    for (const b of blocks) {
      await prisma.presentationBlock.create({
        data: {
          topicId: topic.id,
          mode: b.mode as PresentationMode,
          order: order++,
          contentMd: b.contentMd,
          payload: (b.payload ?? null) as Prisma.InputJsonValue,
        },
      });
      total++;
    }
    console.log(`  ✅ ${slug}: ${blocks.length} blocks`);
  }

  console.log(`✨ Done: ${total} presentation blocks.`);
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
