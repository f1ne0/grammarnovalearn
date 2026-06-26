-- CreateTable
CREATE TABLE "topic_audio" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/wav',
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topic_audio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topic_audio_topicId_key" ON "topic_audio"("topicId");

-- AddForeignKey
ALTER TABLE "topic_audio" ADD CONSTRAINT "topic_audio_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
