/*
  Warnings:

  - You are about to drop the column `group` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ExperimentArm" AS ENUM ('CONTROL', 'EXPERIMENTAL');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "group",
ADD COLUMN     "experimentArm" "ExperimentArm" NOT NULL DEFAULT 'EXPERIMENTAL',
ADD COLUMN     "studyGroupId" TEXT;

-- DropEnum
DROP TYPE "StudyGroup";

-- CreateTable
CREATE TABLE "study_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_settings" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "unlockedUnits" INTEGER[],
    "weakThreshold" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "atRiskThreshold" DOUBLE PRECISION NOT NULL DEFAULT 40,

    CONSTRAINT "group_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "group_settings_groupId_key" ON "group_settings"("groupId");

-- CreateIndex
CREATE INDEX "users_studyGroupId_idx" ON "users"("studyGroupId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "study_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_settings" ADD CONSTRAINT "group_settings_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "study_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
