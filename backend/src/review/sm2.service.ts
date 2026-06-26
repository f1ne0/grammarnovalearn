import { Injectable } from '@nestjs/common';

export interface Sm2Result {
  interval: number; // days
  easeFactor: number;
  repetitions: number;
}

@Injectable()
export class Sm2Service {
  /**
   * SM-2 spaced repetition algorithm.
   * quality: 0-5 — how well the student performed.
   */
  calculate(
    quality: number,
    previousInterval: number,
    previousEaseFactor: number,
    previousRepetitions: number,
  ): Sm2Result {
    let easeFactor =
      previousEaseFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    let interval: number;
    let repetitions: number;

    if (quality < 3) {
      // Failed — reset
      interval = 1;
      repetitions = 0;
    } else {
      repetitions = previousRepetitions + 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 3;
      } else {
        interval = Math.round(previousInterval * easeFactor);
      }
    }

    return { interval, easeFactor, repetitions };
  }
}
