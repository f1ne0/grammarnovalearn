import { Injectable } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { buildGeneratorPrompt } from './prompts/generator.prompt';

export interface GeneratedExercise {
  prompt: string;
  payload: Record<string, unknown>;
}

/** FEATURE 2 — live exercise generation via Gemini. */
@Injectable()
export class GeneratorService {
  constructor(private gemini: GeminiClient) {}

  /** Max exercises per Gemini call — keeps each JSON array short and reliable. */
  private static readonly BATCH = 5;
  private static readonly MAX_COUNT = 50;

  async generate(params: {
    topic: string;
    rule: string;
    type: string;
    difficulty: number;
    count: number;
  }): Promise<GeneratedExercise[]> {
    const target = Math.max(
      1,
      Math.min(params.count, GeneratorService.MAX_COUNT),
    );

    // Generate in batches and backfill until we reach the target (or run out
    // of attempts). One big call produces a long JSON array that the model
    // often truncates/garbles; small batches are far more reliable.
    const out: GeneratedExercise[] = [];
    const maxAttempts = Math.ceil(target / GeneratorService.BATCH) + 2;
    for (let attempt = 0; attempt < maxAttempts && out.length < target; attempt++) {
      const need = Math.min(GeneratorService.BATCH, target - out.length);
      const items = await this.gemini.generateJson<GeneratedExercise[]>(
        buildGeneratorPrompt({ ...params, count: need }),
        30000,
        8192,
        0.9, // higher temperature → more varied scenarios
      );
      if (Array.isArray(items)) {
        out.push(
          ...items.filter(
            (i) =>
              typeof i.prompt === 'string' &&
              i.payload &&
              typeof i.payload === 'object',
          ),
        );
      }
    }

    if (out.length === 0) {
      throw new Error('Generator produced no valid exercises');
    }
    return out.slice(0, target);
  }
}
