import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** FEATURE 6 — lightweight Elo-style adaptivity on the logit scale. */
@Injectable()
export class AdaptiveService {
  constructor(private prisma: PrismaService) {}

  /** Update the user's ability estimate after a submission. */
  async update(
    userId: string,
    topicId: string,
    correct: boolean,
    itemDifficultyLogit: number,
  ) {
    const m = await this.prisma.topicMastery.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
    const ability = m?.abilityEstimate ?? 0;

    const K = 0.3;
    const expected = 1 / (1 + Math.exp(-(ability - itemDifficultyLogit)));
    const newAbility = ability + K * ((correct ? 1 : 0) - expected);

    await this.prisma.topicMastery.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { abilityEstimate: newAbility },
      create: {
        userId,
        topicId,
        abilityEstimate: newAbility,
        attempts: 0,
        correct: 0,
        masteryPct: 0,
      },
    });
  }

  /** Pick the unseen, validated exercise closest to the user's ability. */
  async nextExercise(userId: string, topicId: string) {
    const m = await this.prisma.topicMastery.findUnique({
      where: { userId_topicId: { userId, topicId } },
    });
    const ability = m?.abilityEstimate ?? 0;

    const done = await this.prisma.submission.findMany({
      where: { userId, exercise: { topicId } },
      select: { exerciseId: true },
      distinct: ['exerciseId'],
    });
    const doneIds = done.map((d) => d.exerciseId);

    const candidates = await this.prisma.exercise.findMany({
      where: { topicId, validated: true, id: { notIn: doneIds } },
      select: {
        id: true,
        type: true,
        prompt: true,
        difficulty: true,
        difficultyLogit: true,
        order: true,
      },
    });
    if (candidates.length === 0) return null;

    return candidates.sort(
      (a, b) =>
        Math.abs(a.difficultyLogit - ability) -
        Math.abs(b.difficultyLogit - ability),
    )[0];
  }
}
