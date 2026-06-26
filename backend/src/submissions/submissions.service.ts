import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Exercise, MasteryState, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExercisesService } from '../exercises/exercises.service';
import { FeedbackService } from '../ai/feedback.service';
import { SttService } from '../ai/stt.service';
import { R2Service } from '../storage/r2.service';
import { ReviewService } from '../review/review.service';
import { AdaptiveService } from '../adaptive/adaptive.service';
import { EventsService } from '../events/events.service';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';

interface ExercisePayload {
  correctAnswerId?: string;
  correctAnswers?: string[];
  correctAnswer?: unknown;
  correctOrder?: unknown[];
  pairs?: unknown[];
  explanation?: string;
  [key: string]: unknown;
}

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private prisma: PrismaService,
    private exercisesService: ExercisesService,
    private feedbackService: FeedbackService,
    private sttService: SttService,
    private r2Service: R2Service,
    private reviewService: ReviewService,
    private adaptiveService: AdaptiveService,
    private eventsService: EventsService,
  ) {}

  // ===== SUBMIT EXERCISE =====
  async submitExercise(userId: string, submitExerciseDto: SubmitExerciseDto) {
    const { exerciseId, answer, responseTimeMs } = submitExerciseDto;

    const exercise = await this.exercisesService.getExerciseById(exerciseId);
    const payload = exercise.payload as ExercisePayload;

    const isCorrect = this.checkAnswer(exercise, answer);

    const fb = await this.feedbackService.generate({
      prompt: exercise.prompt,
      studentAnswer: this.extractStudentAnswer(exercise, answer),
      correctAnswer: this.extractCorrectAnswer(exercise),
      rule: payload.explanation || 'Check your grammar.',
      isCorrect,
    });

    const submission = await this.prisma.submission.create({
      data: {
        userId,
        exerciseId,
        answer: answer as Prisma.InputJsonValue,
        isCorrect,
        feedback: fb.feedback,
        feedbackType: fb.feedbackType,
        errorCategory: fb.errorCategory,
        responseTimeMs,
      },
    });

    // Background: don't block the response on bookkeeping
    void Promise.all([
      this.updateMastery(userId, exercise.topicId, isCorrect),
      this.adaptiveService.update(
        userId,
        exercise.topicId,
        isCorrect,
        exercise.difficultyLogit,
      ),
      this.reviewService.recordResult(userId, exercise.id, isCorrect ? 5 : 2),
    ]).catch((e) =>
      this.logger.error(`mastery/review update failed: ${String(e)}`),
    );
    this.eventsService.log(userId, 'submit_exercise', {
      exerciseId,
      isCorrect,
      responseTimeMs,
      errorCategory: fb.errorCategory,
    });

    return {
      id: submission.id,
      isCorrect,
      feedback: fb.feedback,
      errorCategory: fb.errorCategory,
      createdAt: submission.createdAt,
    };
  }

  // ===== SUBMIT SPEAKING EXERCISE (audio upload) =====
  async submitSpeakingExercise(
    userId: string,
    exerciseId: string,
    audioBuffer: Buffer,
    mimeType: string,
  ) {
    const exercise = await this.exercisesService.getExerciseById(exerciseId);

    if (exercise.type !== 'SPEAKING') {
      throw new BadRequestException(
        'This endpoint is only for SPEAKING exercises',
      );
    }

    const payload = exercise.payload as ExercisePayload;

    // 1. Transcribe
    const transcript = await this.sttService.transcribeAudio(
      audioBuffer,
      mimeType,
    );

    // 2. Evaluate
    const evaluation = await this.sttService.evaluateSpeaking(
      transcript,
      exercise.prompt,
      typeof payload.example === 'string' ? payload.example : undefined,
    );

    // 3. Store audio in R2
    const audioKey = `speaking/${userId}/${exerciseId}/${Date.now()}.wav`;
    await this.r2Service.uploadFile(audioKey, audioBuffer, mimeType);

    // 4. Correct if all scores >= 3
    const isCorrect =
      evaluation.clarity >= 3 &&
      evaluation.grammar >= 3 &&
      evaluation.pace >= 3;

    const totalScore =
      (evaluation.clarity + evaluation.grammar + evaluation.pace) / 3;

    // 5. Save submission + speaking details
    const submission = await this.prisma.submission.create({
      data: {
        userId,
        exerciseId,
        answer: { transcript, ...evaluation } as Prisma.InputJsonValue,
        isCorrect,
        feedback: evaluation.feedback,
        speaking: {
          create: {
            audioR2Key: audioKey,
            transcript,
            clarity: evaluation.clarity,
            grammar: evaluation.grammar,
            pace: evaluation.pace,
            totalScore,
            detailedFeedback: evaluation.feedback,
          },
        },
      },
    });

    // 6. Mastery + adaptivity + spaced repetition + event (background)
    void Promise.all([
      this.updateMastery(userId, exercise.topicId, isCorrect),
      this.adaptiveService.update(
        userId,
        exercise.topicId,
        isCorrect,
        exercise.difficultyLogit,
      ),
      this.reviewService.recordResult(
        userId,
        exercise.id,
        Math.round(totalScore),
      ),
    ]).catch((e) =>
      this.logger.error(`mastery/review update failed: ${String(e)}`),
    );
    this.eventsService.log(userId, 'submit_speaking', {
      exerciseId,
      isCorrect,
      totalScore,
    });

    return {
      id: submission.id,
      transcript,
      scores: {
        clarity: evaluation.clarity,
        grammar: evaluation.grammar,
        pace: evaluation.pace,
        total: Math.round(totalScore * 100) / 100,
      },
      isCorrect,
      feedback: evaluation.feedback,
      createdAt: submission.createdAt,
    };
  }

  // ===== CHECK ANSWER =====
  private checkAnswer(
    exercise: Exercise,
    studentAnswer: Record<string, unknown>,
  ): boolean {
    const payload = exercise.payload as ExercisePayload;

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return studentAnswer.selectedOptionId === payload.correctAnswerId;

      case 'FILL_IN_BLANK': {
        // Exact (normalized) match — NOT substring, so "is" doesn't pass "this".
        const norm = (s: string) =>
          s
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ');
        const given = norm(String(studentAnswer.text ?? ''));
        return (payload.correctAnswers ?? []).some((c) => norm(c) === given);
      }

      case 'TRUE_FALSE':
        return studentAnswer.answer === payload.correctAnswer;

      case 'MATCHING': {
        // Order-independent: compare as a set of "left→right" pairs.
        const norm = (arr: unknown) =>
          Array.isArray(arr)
            ? [...(arr as [string, string][])]
                .map((p) => `${p[0]}::${p[1]}`)
                .sort()
                .join('|')
            : '';
        return norm(studentAnswer.pairs) === norm(payload.pairs);
      }

      case 'REORDER':
        return (
          JSON.stringify(studentAnswer.order) ===
          JSON.stringify(payload.correctOrder)
        );

      // ===== Approach 2: deterministic cognitive modes =====
      case 'OPEN_CLOZE':
      case 'WORD_FORMATION':
      case 'KEY_WORD_TRANSFORMATION':
      case 'ERROR_CORRECTION': {
        // All four are "type the answer" → strategy: normalized exact-set match
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
        const given = norm(String(studentAnswer.text ?? ''));
        return accepted.some((a) => norm(a) === given);
      }

      case 'CATEGORIZE': {
        // answer: { assignments: { itemId: categoryId } } vs payload.answer
        const correct = (payload.answer ?? {}) as Record<string, string>;
        const given = (studentAnswer.assignments ?? {}) as Record<
          string,
          string
        >;
        const keys = Object.keys(correct);
        return (
          keys.length > 0 && keys.every((k) => given[k] === correct[k])
        );
      }

      default:
        return false;
    }
  }

  // ===== EXTRACT STUDENT ANSWER (human-readable, for feedback prompt) =====
  private extractStudentAnswer(
    exercise: Exercise,
    answer: Record<string, unknown>,
  ): string {
    const payload = exercise.payload as ExercisePayload;

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE': {
        const options = (payload.options ?? []) as {
          id: string;
          text: string;
        }[];
        const selected = options.find((o) => o.id === answer.selectedOptionId);
        return selected?.text ?? String(answer.selectedOptionId);
      }
      case 'FILL_IN_BLANK':
      case 'OPEN_CLOZE':
      case 'WORD_FORMATION':
      case 'KEY_WORD_TRANSFORMATION':
      case 'ERROR_CORRECTION':
        return String(answer.text ?? '');
      case 'TRUE_FALSE':
        return String(answer.answer);
      case 'MATCHING':
        return JSON.stringify(answer.pairs);
      case 'REORDER':
        return JSON.stringify(answer.order);
      case 'CATEGORIZE':
        return JSON.stringify(answer.assignments);
      default:
        return JSON.stringify(answer);
    }
  }

  // ===== EXTRACT CORRECT ANSWER (for feedback prompt) =====
  private extractCorrectAnswer(exercise: Exercise): string {
    const payload = exercise.payload as ExercisePayload;

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE': {
        const options = (payload.options ?? []) as {
          id: string;
          text: string;
        }[];
        const correct = options.find((o) => o.id === payload.correctAnswerId);
        return correct?.text ?? String(payload.correctAnswerId);
      }
      case 'FILL_IN_BLANK':
      case 'OPEN_CLOZE':
      case 'WORD_FORMATION':
      case 'KEY_WORD_TRANSFORMATION':
      case 'ERROR_CORRECTION':
        return (payload.correctAnswers ?? []).join(' / ');
      case 'TRUE_FALSE':
        return String(payload.correctAnswer);
      case 'MATCHING':
        return JSON.stringify(payload.pairs);
      case 'REORDER':
        return JSON.stringify(payload.correctOrder);
      case 'CATEGORIZE':
        return JSON.stringify(payload.answer);
      default:
        return '';
    }
  }

  // ===== UPDATE MASTERY =====
  private async updateMastery(
    userId: string,
    topicId: string,
    isCorrect: boolean,
  ) {
    const mastery = await this.prisma.topicMastery.findUnique({
      where: {
        userId_topicId: { userId, topicId },
      },
    });

    if (mastery) {
      const attempts = mastery.attempts + 1;
      const correct = isCorrect ? mastery.correct + 1 : mastery.correct;
      const masteryPct = (correct / attempts) * 100;
      const sr = this.computeSpacedRepetition(
        masteryPct,
        attempts,
        mastery.state,
        mastery.reviewCount,
        isCorrect,
      );
      await this.prisma.topicMastery.update({
        where: { userId_topicId: { userId, topicId } },
        data: { attempts, correct, masteryPct, ...sr },
      });
    } else {
      const masteryPct = isCorrect ? 100 : 0;
      const sr = this.computeSpacedRepetition(
        masteryPct,
        1,
        'NEW',
        0,
        isCorrect,
      );
      await this.prisma.topicMastery.create({
        data: {
          userId,
          topicId,
          attempts: 1,
          correct: isCorrect ? 1 : 0,
          masteryPct,
          ...sr,
        },
      });
    }
  }

  // Approach 4: per-topic state machine + spaced-repetition intervals.
  // Intervals (days) by reviewCount: 1, 3, 7, 16, 35.
  private static readonly SR_INTERVALS = [1, 3, 7, 16, 35];

  private computeSpacedRepetition(
    masteryPct: number,
    attempts: number,
    prevState: string,
    reviewCount: number,
    isCorrect: boolean,
  ): { state: MasteryState; nextReviewAt: Date | null; reviewCount: number } {
    // Failure on a previously-mastered topic → demote, reset schedule
    if (!isCorrect && prevState === 'MASTERED') {
      return {
        state: 'LEARNING',
        nextReviewAt: this.daysFromNow(1),
        reviewCount: 0,
      };
    }

    // Reaching mastery threshold (≥75%) with enough attempts → MASTERED
    if (masteryPct >= 75 && attempts >= 4) {
      const nextCount = Math.min(
        reviewCount + 1,
        SubmissionsService.SR_INTERVALS.length,
      );
      const interval =
        SubmissionsService.SR_INTERVALS[
          Math.min(reviewCount, SubmissionsService.SR_INTERVALS.length - 1)
        ];
      return {
        state: 'MASTERED',
        nextReviewAt: this.daysFromNow(interval),
        reviewCount: nextCount,
      };
    }

    if (masteryPct >= 50) {
      return { state: 'PRACTICED', nextReviewAt: null, reviewCount };
    }
    if (attempts >= 1) {
      return { state: 'LEARNING', nextReviewAt: null, reviewCount };
    }
    return { state: 'NEW', nextReviewAt: null, reviewCount };
  }

  private daysFromNow(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  // ===== GET USER SUBMISSIONS (paginated) =====
  async getUserSubmissions(userId: string, page = 1, limit = 20) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where: { userId },
        include: {
          exercise: {
            select: {
              id: true,
              prompt: true,
              type: true,
            },
          },
          speaking: {
            select: {
              clarity: true,
              grammar: true,
              pace: true,
              totalScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.submission.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page: Math.max(page, 1),
      pageCount: Math.ceil(total / take),
    };
  }
}
