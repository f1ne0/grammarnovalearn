-- CreateEnum
CREATE TYPE "PresentationMode" AS ENUM ('DISCOVERY', 'FORM', 'MEANING', 'USE', 'VISUAL', 'CONTRAST', 'CONTEXT', 'ERRORS');

-- CreateEnum
CREATE TYPE "MasteryState" AS ENUM ('NEW', 'LEARNING', 'PRACTICED', 'MASTERED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExerciseType" ADD VALUE 'OPEN_CLOZE';
ALTER TYPE "ExerciseType" ADD VALUE 'WORD_FORMATION';
ALTER TYPE "ExerciseType" ADD VALUE 'KEY_WORD_TRANSFORMATION';
ALTER TYPE "ExerciseType" ADD VALUE 'ERROR_CORRECTION';
ALTER TYPE "ExerciseType" ADD VALUE 'CATEGORIZE';

-- AlterTable
ALTER TABLE "topic_mastery" ADD COLUMN     "nextReviewAt" TIMESTAMP(3),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state" "MasteryState" NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "presentation_blocks" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "mode" "PresentationMode" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "contentMd" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "presentation_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "presentation_blocks_topicId_order_idx" ON "presentation_blocks"("topicId", "order");

-- CreateIndex
CREATE INDEX "topic_mastery_userId_nextReviewAt_idx" ON "topic_mastery"("userId", "nextReviewAt");

-- AddForeignKey
ALTER TABLE "presentation_blocks" ADD CONSTRAINT "presentation_blocks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
