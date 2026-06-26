import { Injectable, Logger } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { buildWritingPrompt } from './prompts/writing.prompt';
import { buildRichWritingPrompt } from './prompts/rich-writing.prompt';

export interface WritingError {
  type: string;
  original: string;
  correction: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface WritingAnalysis {
  errors: WritingError[];
  overallFeedback: string;
  grammarScore: number;
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Approach 7 — richer writing rubric returned by the async analysis job. */
export interface RichWritingAnalysis extends WritingAnalysis {
  cefr: CefrLevel;
  vocabularyScore: number;
  coherenceScore: number;
  taskAchievement: number;
  strengths: string[];
  rewrite: string;
}

/** FEATURE 3 — writing analysis with char-level error indices. */
@Injectable()
export class WritingAnalysisService {
  private readonly logger = new Logger(WritingAnalysisService.name);

  constructor(private gemini: GeminiClient) {}

  async analyze(text: string): Promise<WritingAnalysis> {
    try {
      const a = await this.gemini.generateJson<WritingAnalysis>(
        buildWritingPrompt(text),
        15000,
      );
      a.errors = this.sanitizeErrors(text, a.errors);
      a.grammarScore = this.clamp100(a.grammarScore);
      a.overallFeedback = a.overallFeedback || 'Analysis complete.';
      return a;
    } catch (e) {
      this.logger.error(`Writing analysis failed: ${String(e)}`);
      return {
        errors: [],
        overallFeedback: 'Could not analyze right now. Please try again.',
        grammarScore: 0,
      };
    }
  }

  /**
   * Approach 7 — richer rubric (CEFR, vocabulary, coherence, task achievement,
   * model rewrite). Throws on failure so the async job is marked FAILED and the
   * client can retry, rather than silently returning an empty result.
   */
  async analyzeRich(
    text: string,
    taskPrompt?: string,
  ): Promise<RichWritingAnalysis> {
    const a = await this.gemini.generateJson<RichWritingAnalysis>(
      buildRichWritingPrompt(text, taskPrompt),
      30000,
      4096,
    );
    const cefr: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return {
      errors: this.sanitizeErrors(text, a.errors),
      overallFeedback: a.overallFeedback || 'Analysis complete.',
      grammarScore: this.clamp100(a.grammarScore),
      cefr: cefr.includes(a.cefr) ? a.cefr : 'B1',
      vocabularyScore: this.clamp100(a.vocabularyScore),
      coherenceScore: this.clamp100(a.coherenceScore),
      taskAchievement: this.clamp100(a.taskAchievement),
      strengths: Array.isArray(a.strengths)
        ? a.strengths.filter((s) => typeof s === 'string').slice(0, 4)
        : [],
      rewrite: typeof a.rewrite === 'string' ? a.rewrite : '',
    };
  }

  private sanitizeErrors(
    text: string,
    errors: WritingError[] = [],
  ): WritingError[] {
    return (errors ?? [])
      .map((e) => {
        const idx = text.indexOf(e.original);
        if (idx >= 0) {
          return { ...e, startIndex: idx, endIndex: idx + e.original.length };
        }
        return e;
      })
      .filter(
        (e) =>
          e.startIndex >= 0 &&
          e.endIndex <= text.length &&
          e.startIndex < e.endIndex &&
          text.slice(e.startIndex, e.endIndex) === e.original,
      );
  }

  private clamp100(n: unknown): number {
    return Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  }
}
