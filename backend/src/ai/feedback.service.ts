import { Injectable, Logger } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { buildFeedbackPrompt } from './prompts/feedback.prompt';

export interface FeedbackResult {
  isCorrect: boolean;
  errorCategory: string;
  feedbackType: 'metalinguistic' | 'fallback';
  feedback: string;
}

/** Metalinguistic AI feedback with error category for every answer. */
@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private gemini: GeminiClient) {}

  async generate(params: {
    prompt: string;
    studentAnswer: string;
    correctAnswer: string;
    rule: string;
    isCorrect: boolean; // deterministic check already done
  }): Promise<FeedbackResult> {
    try {
      const result = await this.gemini.generateJson<{
        errorCategory: string;
        feedback: string;
      }>(buildFeedbackPrompt(params));
      return {
        isCorrect: params.isCorrect,
        errorCategory: params.isCorrect ? 'none' : result.errorCategory,
        feedbackType: 'metalinguistic',
        feedback: result.feedback,
      };
    } catch (e) {
      this.logger.error(`Feedback generation failed: ${String(e)}`);
      return {
        isCorrect: params.isCorrect,
        errorCategory: 'unclassified',
        feedbackType: 'fallback',
        feedback: params.isCorrect
          ? 'Correct! Well done.'
          : `Not quite. The correct answer is "${params.correctAnswer}". ${params.rule}`,
      };
    }
  }
}
