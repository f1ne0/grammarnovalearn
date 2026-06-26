-- AlterEnum
ALTER TYPE "ExerciseType" ADD VALUE 'SPEAKING';

-- CreateTable
CREATE TABLE "speaking_submissions" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "audioR2Key" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "clarity" INTEGER NOT NULL,
    "grammar" INTEGER NOT NULL,
    "pace" INTEGER NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "detailedFeedback" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaking_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topicIds" TEXT[],
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "quality" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" TIMESTAMP(3) NOT NULL,
    "lastReviewDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "speaking_submissions_submissionId_key" ON "speaking_submissions"("submissionId");

-- CreateIndex
CREATE INDEX "assignments_createdBy_idx" ON "assignments"("createdBy");

-- CreateIndex
CREATE INDEX "review_items_userId_idx" ON "review_items"("userId");

-- CreateIndex
CREATE INDEX "review_items_nextReviewDate_idx" ON "review_items"("nextReviewDate");

-- CreateIndex
CREATE INDEX "review_items_userId_nextReviewDate_idx" ON "review_items"("userId", "nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "review_items_userId_exerciseId_key" ON "review_items"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "submissions_userId_createdAt_idx" ON "submissions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "submissions_exerciseId_isCorrect_idx" ON "submissions"("exerciseId", "isCorrect");

-- AddForeignKey
ALTER TABLE "speaking_submissions" ADD CONSTRAINT "speaking_submissions_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
