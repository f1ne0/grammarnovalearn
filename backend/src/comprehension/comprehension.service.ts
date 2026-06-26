import { Injectable } from '@nestjs/common';
import {
  COMPREHENSION,
  ComprehensionQuestion,
} from './comprehension.content';

export type Channel = 'reading' | 'listening';

/** A question with the answer key stripped — safe to send to the client. */
export interface PublicQuestion {
  id: string;
  type: ComprehensionQuestion['type'];
  prompt: string;
  options?: { id: string; text: string }[];
}

export interface GradedDetail {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string | boolean;
  explanation?: string;
}

export interface GradeResult {
  score: number; // 0..100
  correct: number;
  total: number;
  detailed: GradedDetail[];
}

export interface SubmittedAnswer {
  questionId: string;
  value: string | boolean;
}

/**
 * Approach 6 — serves comprehension questions and grades them server-side.
 * Pure in-memory content (no DB), so there is no schema dependency.
 */
@Injectable()
export class ComprehensionService {
  /** Channel currently doesn't change the question set, but is kept for
   *  future per-channel variants and for honest typing at call sites. */
  questionsFor(slug: string, _channel: Channel): PublicQuestion[] {
    const list = COMPREHENSION[slug] ?? [];
    return list.map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
    }));
  }

  hasQuestions(slug: string): boolean {
    return (COMPREHENSION[slug] ?? []).length > 0;
  }

  /**
   * Grade submitted answers. Returns null when the topic has no comprehension
   * set (so callers can skip recording a score).
   */
  grade(slug: string, answers: SubmittedAnswer[]): GradeResult | null {
    const list = COMPREHENSION[slug] ?? [];
    if (list.length === 0) return null;

    const byId = new Map(answers.map((a) => [a.questionId, a.value]));
    const detailed: GradedDetail[] = list.map((q) => {
      const given = byId.get(q.id);
      const isCorrect = this.matches(q, given);
      return {
        questionId: q.id,
        isCorrect,
        correctAnswer: q.answer,
        explanation: q.explanation,
      };
    });

    const correct = detailed.filter((d) => d.isCorrect).length;
    const total = list.length;
    const score = Math.round((correct / total) * 100);
    return { score, correct, total, detailed };
  }

  private matches(q: ComprehensionQuestion, given: unknown): boolean {
    if (given === undefined || given === null) return false;
    if (q.type === 'TRUE_FALSE') {
      return typeof given === 'boolean' && given === q.answer;
    }
    // MULTIPLE_CHOICE: option id comparison (string)
    return String(given) === String(q.answer);
  }
}
