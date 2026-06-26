import { Injectable } from '@nestjs/common';

interface GradablePayload {
  correctAnswerId?: string;
  correctAnswers?: string[];
  correctAnswer?: unknown;
  correctOrder?: unknown[];
  pairs?: unknown[];
  answer?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Approach 5 — standalone deterministic grader for knowledge checks.
 * Independent copy (does not touch SubmissionsService). AI/speaking → false.
 */
@Injectable()
export class GradingService {
  check(
    type: string,
    payload: GradablePayload,
    answer: Record<string, unknown>,
  ): boolean {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return answer.selectedOptionId === payload.correctAnswerId;

      case 'TRUE_FALSE':
        return answer.answer === payload.correctAnswer;

      case 'MATCHING':
        return JSON.stringify(answer.pairs) === JSON.stringify(payload.pairs);

      case 'REORDER':
        return (
          JSON.stringify(answer.order) === JSON.stringify(payload.correctOrder)
        );

      case 'FILL_IN_BLANK':
      case 'OPEN_CLOZE':
      case 'WORD_FORMATION':
      case 'KEY_WORD_TRANSFORMATION':
      case 'ERROR_CORRECTION': {
        const accepted = (payload.correctAnswers ??
          (payload.correctAnswer != null
            ? [String(payload.correctAnswer)]
            : [])) as string[];
        const norm = (s: string) =>
          s
            .trim()
            .toLowerCase()
            .replace(/[.,!?;:"']/g, '')
            .replace(/\s+/g, ' ');
        const given = norm(String(answer.text ?? ''));
        return accepted.some((a) => norm(a) === given);
      }

      case 'CATEGORIZE': {
        const correct = (payload.answer ?? {}) as Record<string, string>;
        const given = (answer.assignments ?? {}) as Record<string, string>;
        const keys = Object.keys(correct);
        return keys.length > 0 && keys.every((k) => given[k] === correct[k]);
      }

      default:
        return false; // AI / speaking types are not auto-gradable
    }
  }
}
