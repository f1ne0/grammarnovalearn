import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sm2Service } from './sm2.service';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private sm2: Sm2Service,
  ) {}

  /**
   * Record an exercise result and (re)schedule the next review (SM-2).
   * Called from SubmissionsService on every submission.
   */
  async recordResult(userId: string, exerciseId: string, quality: number) {
    const existing = await this.prisma.reviewItem.findUnique({
      where: { userId_exerciseId: { userId, exerciseId } },
    });

    const { interval, easeFactor, repetitions } = this.sm2.calculate(
      quality,
      existing?.interval ?? 0,
      existing?.easeFactor ?? 2.5,
      existing?.repetitions ?? 0,
    );

    const now = new Date();
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    await this.prisma.reviewItem.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      update: {
        interval,
        easeFactor,
        repetitions,
        quality,
        lastReviewDate: now,
        nextReviewDate,
      },
      create: {
        userId,
        exerciseId,
        interval,
        easeFactor,
        repetitions,
        quality,
        lastReviewDate: now,
        nextReviewDate,
      },
    });
  }

  /** Exercises due for review today (max 10). */
  async getReviewQueue(userId: string) {
    return this.prisma.reviewItem.findMany({
      where: {
        userId,
        nextReviewDate: { lte: new Date() },
      },
      include: {
        exercise: {
          select: {
            id: true,
            topicId: true,
            prompt: true,
            type: true,
            difficulty: true,
          },
        },
      },
      orderBy: { nextReviewDate: 'asc' },
      take: 10,
    });
  }

  /** Review stats: due now, scheduled total, next date. */
  async getReviewStats(userId: string) {
    const now = new Date();
    const [due, total, next] = await Promise.all([
      this.prisma.reviewItem.count({
        where: { userId, nextReviewDate: { lte: now } },
      }),
      this.prisma.reviewItem.count({ where: { userId } }),
      this.prisma.reviewItem.findFirst({
        where: { userId, nextReviewDate: { gt: now } },
        orderBy: { nextReviewDate: 'asc' },
        select: { nextReviewDate: true },
      }),
    ]);

    return {
      dueNow: due,
      totalTracked: total,
      nextReviewAt: next?.nextReviewDate ?? null,
    };
  }
}
