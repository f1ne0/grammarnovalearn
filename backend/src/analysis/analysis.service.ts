import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import {
  RichWritingAnalysis,
  WritingAnalysisService,
} from '../ai/writing-analysis.service';
import { RichSpeakingEvaluation, SttService } from '../ai/stt.service';
import { JobsService } from './jobs.service';

/**
 * Approach 7 — orchestrates slow AI feedback for the productive skills
 * (writing & speaking) through the async {@link JobsService}. Each enqueue
 * returns a job id immediately; the heavy Gemini call runs in the background.
 */
@Injectable()
export class AnalysisService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private jobs: JobsService,
    private writing: WritingAnalysisService,
    private stt: SttService,
  ) {}

  // ===== WRITING =====
  async enqueueWriting(
    userId: string,
    input: { writingTaskId: string; text: string; responseTimeMs?: number },
  ): Promise<{ jobId: string }> {
    const task = await this.prisma.writingTask.findUnique({
      where: { id: input.writingTaskId },
      select: { id: true, prompt: true },
    });
    if (!task) {
      throw new NotFoundException(
        `Writing task "${input.writingTaskId}" not found`,
      );
    }

    const jobId = this.jobs.start<RichWritingAnalysis & { submissionId: string }>(
      userId,
      'WRITING',
      async () => {
        const a = await this.writing.analyzeRich(input.text, task.prompt);

        // Persist core fields (existing table); rich fields live in the job.
        const submission = await this.prisma.writingSubmission.create({
          data: {
            userId,
            writingTaskId: task.id,
            text: input.text,
            wordCount: input.text.trim().split(/\s+/).length,
            errors: a.errors as unknown as Prisma.InputJsonValue,
            overallFeedback: a.overallFeedback,
            grammarScore: a.grammarScore,
            responseTimeMs: input.responseTimeMs,
          },
          select: { id: true },
        });

        this.events.log(userId, 'analyze_writing', {
          taskId: task.id,
          grammarScore: a.grammarScore,
          cefr: a.cefr,
          errorCount: a.errors.length,
        });

        return { ...a, submissionId: submission.id };
      },
    );

    return { jobId };
  }

  // ===== SPEAKING =====
  enqueueSpeaking(
    userId: string,
    input: {
      audio: Buffer;
      mimeType: string;
      prompt: string;
      example?: string;
    },
  ): { jobId: string } {
    const jobId = this.jobs.start<RichSpeakingEvaluation>(
      userId,
      'SPEAKING',
      async () => {
        const result = await this.stt.evaluateRichFromAudio(
          input.audio,
          input.mimeType,
          input.prompt,
          input.example,
        );
        this.events.log(userId, 'analyze_speaking', {
          fluency: result.fluency,
          pronunciation: result.pronunciation,
          relevance: result.relevance,
        });
        return result;
      },
    );
    return { jobId };
  }

  // ===== STATUS =====
  get(jobId: string, userId: string) {
    const job = this.jobs.get(jobId, userId);
    if (!job) throw new NotFoundException('Job not found');
    return {
      id: job.id,
      kind: job.kind,
      status: job.status,
      result: job.result ?? null,
      error: job.error ?? null,
    };
  }
}
