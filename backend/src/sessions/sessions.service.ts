import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import {
  Channel,
  ComprehensionService,
  GradeResult,
  SubmittedAnswer,
} from '../comprehension/comprehension.service';

/** Reading & Listening sessions: timing, WPM, comprehension. */
@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsService,
    private comprehension: ComprehensionService,
  ) {}

  /** Approach 6 — comprehension questions for a topic's reading/listening. */
  async questions(topicSlug: string, channel: Channel) {
    const topic = await this.topicBySlug(topicSlug);
    void topic; // validates the slug exists
    return this.comprehension.questionsFor(topicSlug, channel);
  }

  // ===== READING =====
  async startReading(userId: string, topicSlug: string) {
    const topic = await this.topicBySlug(topicSlug);
    const session = await this.prisma.readingSession.create({
      data: { userId, topicId: topic.id },
    });
    this.events.log(userId, 'start_reading', { topicId: topic.id });
    return session;
  }

  async completeReading(
    userId: string,
    sessionId: string,
    opts: {
      comprehensionScore?: number;
      answers?: SubmittedAnswer[];
      /** Client-measured reading duration; keeps WPM accurate when a
       *  comprehension quiz is answered after the passage. */
      readingTimeMs?: number;
    } = {},
  ) {
    const session = await this.prisma.readingSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Reading session not found');
    }
    if (session.completedAt) {
      throw new BadRequestException('Session already completed');
    }

    const topic = await this.prisma.topic.findUniqueOrThrow({
      where: { id: session.topicId },
      select: { slug: true, readingText: true },
    });

    const completedAt = new Date();
    const elapsed = completedAt.getTime() - session.startedAt.getTime();
    const readingTimeMs =
      opts.readingTimeMs !== undefined && opts.readingTimeMs > 0
        ? Math.min(opts.readingTimeMs, elapsed)
        : elapsed;
    const wordCount = topic.readingText.trim().split(/\s+/).length;
    const wpm = readingTimeMs > 0 ? wordCount / (readingTimeMs / 60000) : null;

    // Grade comprehension server-side when answers are supplied.
    const graded = this.gradeIfAny(topic.slug, opts);

    const updated = await this.prisma.readingSession.update({
      where: { id: sessionId },
      data: {
        completedAt,
        readingTimeMs,
        wpm,
        comprehensionScore: this.scoreFrom(graded, opts.comprehensionScore),
      },
    });
    this.events.log(userId, 'complete_reading', {
      sessionId,
      readingTimeMs,
      wpm,
      comprehensionScore: updated.comprehensionScore,
    });
    return { ...updated, comprehension: graded };
  }

  // ===== LISTENING =====
  async startListening(userId: string, topicSlug: string) {
    const topic = await this.topicBySlug(topicSlug);
    const session = await this.prisma.listeningSession.create({
      data: { userId, topicId: topic.id },
    });
    this.events.log(userId, 'start_listening', { topicId: topic.id });
    return session;
  }

  async completeListening(
    userId: string,
    sessionId: string,
    dto: {
      playCount?: number;
      playbackSpeed?: number;
      comprehensionScore?: number;
      answers?: SubmittedAnswer[];
    },
  ) {
    const session = await this.prisma.listeningSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Listening session not found');
    }
    if (session.completedAt) {
      throw new BadRequestException('Session already completed');
    }

    const topic = await this.prisma.topic.findUniqueOrThrow({
      where: { id: session.topicId },
      select: { slug: true },
    });
    const graded = this.gradeIfAny(topic.slug, dto);

    const updated = await this.prisma.listeningSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        playCount: dto.playCount ?? session.playCount,
        playbackSpeed: dto.playbackSpeed ?? session.playbackSpeed,
        comprehensionScore: this.scoreFrom(graded, dto.comprehensionScore),
      },
    });
    this.events.log(userId, 'complete_listening', {
      sessionId,
      playCount: updated.playCount,
      comprehensionScore: updated.comprehensionScore,
    });
    return { ...updated, comprehension: graded };
  }

  private async topicBySlug(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);
    return topic;
  }

  private clampScore(s?: number): number | null {
    if (s === undefined || s === null) return null;
    return Math.max(0, Math.min(100, s));
  }

  private gradeIfAny(
    slug: string,
    opts: { answers?: SubmittedAnswer[] },
  ): GradeResult | null {
    if (!opts.answers || opts.answers.length === 0) return null;
    return this.comprehension.grade(slug, opts.answers);
  }

  /** Prefer a server-graded score; fall back to a client-supplied one. */
  private scoreFrom(
    graded: GradeResult | null,
    clientScore?: number,
  ): number | null {
    if (graded) return graded.score;
    return this.clampScore(clientScore);
  }
}
