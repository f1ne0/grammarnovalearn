import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { TtsService } from '../ai/tts.service';
import { GeminiClient } from '../ai/gemini.client';
import { PresentationMode } from '@prisma/client';
import { buildPresentationPrompt } from '../ai/prompts/presentation.prompt';

@Injectable()
export class TopicsService {
  constructor(
    private prisma: PrismaService,
    private ttsService: TtsService,
    private gemini: GeminiClient,
  ) {}

  /** Teacher tool: draft a B2/IT reading passage for a topic title. */
  async generateReadingText(title: string): Promise<{ readingText: string }> {
    const prompt = `
Write a short reading passage in English for IT students at B2 level that
naturally demonstrates the grammar topic "${title}".
Requirements: 4-6 sentences, an IT/tech workplace context, the target grammar
appearing several times, plain connected prose (no title, no list, no markdown).
Return ONLY the passage text.`.trim();
    const raw = await this.gemini.generateText(prompt, 15000, 512);
    const readingText = raw.replace(/```/g, '').trim();
    if (!readingText) {
      throw new BadRequestException('Could not generate a passage. Try again.');
    }
    return { readingText };
  }

  // ===== Approach 1: multi-mode presentation (ось A) =====
  async getPresentations(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });
    if (!topic) {
      throw new NotFoundException(`Topic "${slug}" not found`);
    }
    const blocks = await this.prisma.presentationBlock.findMany({
      where: { topicId: topic.id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        mode: true,
        order: true,
        contentMd: true,
        payload: true,
      },
    });
    return { topic: { title: topic.title }, blocks };
  }

  /**
   * Audio for a topic's readingText. Generated once via Gemini TTS
   * and cached in DB; regenerated when text or voice changes.
   */
  async getTopicAudio(slug: string): Promise<Buffer> {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true, readingText: true },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with slug "${slug}" not found`);
    }

    const voice = this.ttsService.defaultVoice;
    const contentHash = createHash('sha256')
      .update(`${topic.readingText}::${voice}`)
      .digest('hex');

    const cached = await this.prisma.topicAudio.findUnique({
      where: { topicId: topic.id },
    });

    if (cached && cached.contentHash === contentHash) {
      return Buffer.from(cached.data);
    }

    const wav = await this.ttsService.synthesize(topic.readingText, voice);
    const data = new Uint8Array(wav); // Prisma Bytes

    await this.prisma.topicAudio.upsert({
      where: { topicId: topic.id },
      update: { voice, contentHash, data },
      create: {
        topicId: topic.id,
        voice,
        contentHash,
        data,
      },
    });

    return wav;
  }

  // In-memory cache for the static topic list (same for everyone).
  // Topics rarely change; only per-user mastery is dynamic.
  private static topicsCache: {
    data: {
      id: string;
      slug: string;
      title: string;
      unit: number;
      order: number;
      readingText: string;
      exerciseCount: number;
    }[];
    expires: number;
  } | null = null;
  private static readonly CACHE_TTL_MS = 60_000;

  // Per-user unlocked-units cache (60s) — avoids a user lookup on every
  // /topics call, which was a hot path contributing to pool exhaustion.
  private static gatingCache = new Map<
    string,
    { units: number[] | null; expires: number }
  >();

  private async unlockedUnitsForUser(userId: string): Promise<number[] | null> {
    const now = Date.now();
    const cached = TopicsService.gatingCache.get(userId);
    if (cached && cached.expires > now) return cached.units;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, studyGroup: { select: { settings: true } } },
    });
    let units: number[] | null = null;
    if (user?.role === 'STUDENT') {
      const u = user.studyGroup?.settings?.unlockedUnits;
      if (u && u.length > 0) units = u;
    }
    TopicsService.gatingCache.set(userId, {
      units,
      expires: now + TopicsService.CACHE_TTL_MS,
    });
    return units;
  }

  async getAllTopics(userId?: string) {
    // Content gating: which units are unlocked for this user's group (cached)
    const unlockedUnits = userId
      ? await this.unlockedUnitsForUser(userId)
      : null;

    // 1. Static topic list (cached 60s)
    const now = Date.now();
    if (
      !TopicsService.topicsCache ||
      TopicsService.topicsCache.expires < now
    ) {
      const topics = await this.prisma.topic.findMany({
        orderBy: [{ unit: 'asc' }, { order: 'asc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          unit: true,
          order: true,
          readingText: true,
          _count: { select: { exercises: true } },
        },
      });
      TopicsService.topicsCache = {
        data: topics.map((t) => ({
          id: t.id,
          slug: t.slug,
          title: t.title,
          unit: t.unit,
          order: t.order,
          readingText: t.readingText,
          exerciseCount: t._count.exercises,
        })),
        expires: now + TopicsService.CACHE_TTL_MS,
      };
    }
    let baseTopics = TopicsService.topicsCache.data;
    if (unlockedUnits) {
      baseTopics = baseTopics.filter((t) => unlockedUnits.includes(t.unit));
    }

    // 2. Per-user mastery (lightweight single query)
    let masteryByTopic = new Map<string, number>();
    if (userId) {
      const mastery = await this.prisma.topicMastery.findMany({
        where: { userId },
        select: { topicId: true, masteryPct: true },
      });
      masteryByTopic = new Map(mastery.map((m) => [m.topicId, m.masteryPct]));
    }

    return baseTopics.map((t) => ({
      ...t,
      masteryPct: masteryByTopic.get(t.id) ?? 0,
    }));
  }

  /** Invalidate the static cache (call after content changes). */
  static invalidateTopicsCache() {
    TopicsService.topicsCache = null;
  }

  // ===== TEACHER: content management (topics ≈ units) =====
  async createTopic(dto: {
    title: string;
    slug: string;
    unit: number;
    order: number;
    readingText: string;
  }) {
    // Auto-uniquify the slug instead of failing (e.g. present-perfect-2).
    const base = dto.slug;
    let slug = base;
    let n = 1;
    while (
      await this.prisma.topic.findUnique({
        where: { slug },
        select: { id: true },
      })
    ) {
      n += 1;
      slug = `${base}-${n}`;
    }
    const topic = await this.prisma.topic.create({ data: { ...dto, slug } });
    TopicsService.invalidateTopicsCache();
    return topic;
  }

  async updateTopic(
    id: string,
    dto: {
      title?: string;
      slug?: string;
      unit?: number;
      order?: number;
      readingText?: string;
    },
  ) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) throw new NotFoundException(`Topic "${id}" not found`);
    if (dto.slug && dto.slug !== topic.slug) {
      const dup = await this.prisma.topic.findUnique({
        where: { slug: dto.slug },
        select: { id: true },
      });
      if (dup) throw new BadRequestException(`Slug "${dto.slug}" is already in use`);
    }
    const updated = await this.prisma.topic.update({ where: { id }, data: dto });
    TopicsService.invalidateTopicsCache();
    return updated;
  }

  /** Teacher tool: AI-generate the multi-mode "Learn" presentation. */
  async generatePresentation(slug: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      select: { id: true, title: true, readingText: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${slug}" not found`);

    const blocks = await this.gemini.generateJson<
      { mode: string; contentMd: string }[]
    >(buildPresentationPrompt(topic.title, topic.readingText), 30000, 4096, 0.6);

    const valid = (Array.isArray(blocks) ? blocks : [])
      .filter(
        (b) =>
          b &&
          typeof b.contentMd === 'string' &&
          b.contentMd.trim().length > 0 &&
          (PresentationMode as Record<string, string>)[b.mode],
      )
      .slice(0, 8);
    if (valid.length === 0) {
      throw new BadRequestException('Could not generate a presentation. Try again.');
    }

    // Replace any existing presentation for this topic.
    await this.prisma.presentationBlock.deleteMany({
      where: { topicId: topic.id },
    });
    await this.prisma.presentationBlock.createMany({
      data: valid.map((b, i) => ({
        topicId: topic.id,
        mode: b.mode as PresentationMode,
        order: i,
        contentMd: b.contentMd.trim(),
      })),
    });
    return { generated: valid.length };
  }

  async deleteTopic(id: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!topic) throw new NotFoundException(`Topic "${id}" not found`);
    // Cascades remove exercises (+submissions), presentations, audio, mastery.
    await this.prisma.topic.delete({ where: { id } });
    TopicsService.invalidateTopicsCache();
    return { deleted: true };
  }

  async getTopicBySlug(slug: string, userId?: string) {
    const topic = await this.prisma.topic.findUnique({
      where: { slug },
      include: {
        exercises: {
          where: { validated: true }, // hide AI exercises pending approval
          select: {
            id: true,
            type: true,
            prompt: true,
            difficulty: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        mastery: userId
          ? {
              where: { userId },
            }
          : false,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with slug "${slug}" not found`);
    }

    return {
      ...topic,
      masteryPct:
        userId && topic.mastery && topic.mastery.length > 0
          ? topic.mastery[0].masteryPct
          : 0,
    };
  }
}
