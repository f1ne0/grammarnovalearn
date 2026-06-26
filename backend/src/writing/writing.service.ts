import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WritingAnalysisService } from '../ai/writing-analysis.service';
import { EventsService } from '../events/events.service';
import { SubmitWritingDto } from './dto/submit-writing.dto';

@Injectable()
export class WritingService {
  constructor(
    private prisma: PrismaService,
    private analysis: WritingAnalysisService,
    private events: EventsService,
  ) {}

  /** Writing tasks for a topic (or general tasks if topicId is null). */
  async getTasksByTopic(topicSlug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug: topicSlug },
      select: { id: true },
    });
    if (!topic) {
      throw new NotFoundException(`Topic "${topicSlug}" not found`);
    }
    return this.prisma.writingTask.findMany({
      where: { OR: [{ topicId: topic.id }, { topicId: null }] },
      orderBy: { createdAt: 'asc' },
    });
  }

  // FEATURE 3: analyze and store
  async submit(userId: string, dto: SubmitWritingDto) {
    const task = await this.prisma.writingTask.findUnique({
      where: { id: dto.writingTaskId },
    });
    if (!task) {
      throw new NotFoundException(
        `Writing task "${dto.writingTaskId}" not found`,
      );
    }

    const a = await this.analysis.analyze(dto.text);

    const submission = await this.prisma.writingSubmission.create({
      data: {
        userId,
        writingTaskId: dto.writingTaskId,
        text: dto.text,
        wordCount: dto.text.trim().split(/\s+/).length,
        errors: a.errors as unknown as Prisma.InputJsonValue,
        overallFeedback: a.overallFeedback,
        grammarScore: a.grammarScore,
        responseTimeMs: dto.responseTimeMs,
      },
    });

    this.events.log(userId, 'submit_writing', {
      taskId: dto.writingTaskId,
      score: a.grammarScore,
      errorCount: a.errors.length,
    });

    return { id: submission.id, ...a };
  }

  async history(userId: string) {
    return this.prisma.writingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { task: { select: { prompt: true } } },
    });
  }
}
