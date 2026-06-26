-- CreateEnum
CREATE TYPE "StudyGroup" AS ENUM ('CONTROL', 'EXPERIMENTAL');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('PRE_TEST', 'POST_TEST', 'DELAYED_POST', 'QUIZ');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "difficultyLogit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "errorCategory" TEXT,
ADD COLUMN     "feedbackType" TEXT,
ADD COLUMN     "responseTimeMs" INTEGER;

-- AlterTable
ALTER TABLE "topic_mastery" ADD COLUMN     "abilityEstimate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "consentGivenAt" TIMESTAMP(3),
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "group" "StudyGroup" NOT NULL DEFAULT 'EXPERIMENTAL',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "learning_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_tasks" (
    "id" TEXT NOT NULL,
    "topicId" TEXT,
    "prompt" TEXT NOT NULL,
    "minWords" INTEGER NOT NULL DEFAULT 50,
    "maxWords" INTEGER NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "writing_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "writingTaskId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "errors" JSONB NOT NULL,
    "overallFeedback" TEXT NOT NULL,
    "grammarScore" INTEGER NOT NULL,
    "responseTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "readingTimeMs" INTEGER,
    "wpm" DOUBLE PRECISION,
    "comprehensionScore" DOUBLE PRECISION,

    CONSTRAINT "reading_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listening_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "playbackSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "comprehensionScore" DOUBLE PRECISION,

    CONSTRAINT "listening_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "TestType" NOT NULL DEFAULT 'QUIZ',
    "topicIds" TEXT[],
    "questionIds" TEXT[],
    "durationMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_events_userId_idx" ON "learning_events"("userId");

-- CreateIndex
CREATE INDEX "learning_events_eventType_idx" ON "learning_events"("eventType");

-- CreateIndex
CREATE INDEX "learning_events_createdAt_idx" ON "learning_events"("createdAt");

-- CreateIndex
CREATE INDEX "writing_tasks_topicId_idx" ON "writing_tasks"("topicId");

-- CreateIndex
CREATE INDEX "writing_submissions_userId_idx" ON "writing_submissions"("userId");

-- CreateIndex
CREATE INDEX "writing_submissions_writingTaskId_idx" ON "writing_submissions"("writingTaskId");

-- CreateIndex
CREATE INDEX "reading_sessions_userId_idx" ON "reading_sessions"("userId");

-- CreateIndex
CREATE INDEX "reading_sessions_topicId_idx" ON "reading_sessions"("topicId");

-- CreateIndex
CREATE INDEX "listening_sessions_userId_idx" ON "listening_sessions"("userId");

-- CreateIndex
CREATE INDEX "listening_sessions_topicId_idx" ON "listening_sessions"("topicId");

-- CreateIndex
CREATE INDEX "test_attempts_userId_idx" ON "test_attempts"("userId");

-- CreateIndex
CREATE INDEX "test_attempts_testId_idx" ON "test_attempts"("testId");

-- AddForeignKey
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_writingTaskId_fkey" FOREIGN KEY ("writingTaskId") REFERENCES "writing_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_sessions" ADD CONSTRAINT "reading_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_sessions" ADD CONSTRAINT "listening_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
