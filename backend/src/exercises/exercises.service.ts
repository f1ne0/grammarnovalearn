import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GeneratorService } from '../ai/generator.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { GenerateExercisesDto } from './dto/generate-exercises.dto';

/** Map 1-5 UI difficulty to the logit scale used by adaptivity. */
export function difficultyToLogit(d: number): number {
  return (d - 3) * 0.75; // 1→-1.5, 3→0, 5→+1.5
}

@Injectable()
export class ExercisesService {
  constructor(
    private prisma: PrismaService,
    private generatorService: GeneratorService,
  ) {}

  async getExercisesByTopic(topicId: string) {
    return this.prisma.exercise.findMany({
      where: { topicId, validated: true }, // exclude AI exercises pending approval
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        prompt: true,
        difficulty: true,
        order: true,
      },
    });
  }

  /** Full exercise incl. answers — INTERNAL use only (scoring). Never return
   *  this straight to a student-facing endpoint. */
  async getExerciseById(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with id "${id}" not found`);
    }

    return exercise;
  }

  /** Student-safe exercise: only validated (excludes pending AI + test-only
   *  questions) and with answer keys stripped from the payload. */
  async getExerciseForPlay(id: string) {
    const exercise = await this.prisma.exercise.findFirst({
      where: { id, validated: true },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise with id "${id}" not found`);
    }
    const {
      correctAnswerId: _a,
      correctAnswers: _b,
      correctAnswer: _c,
      correctOrder: _d,
      pairs: _e,
      explanation: _f,
      ...safePayload
    } = (exercise.payload ?? {}) as Record<string, unknown>;
    return { ...exercise, payload: safePayload };
  }

  async createExercise(createExerciseDto: CreateExerciseDto) {
    const { topicId, type, prompt, payload, difficulty, order } =
      createExerciseDto;

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with id "${topicId}" not found`);
    }

    return this.prisma.exercise.create({
      data: {
        topicId,
        type,
        prompt,
        payload: payload as Prisma.InputJsonValue,
        difficulty,
        difficultyLogit: difficultyToLogit(difficulty ?? 3),
        order,
      },
    });
  }

  // ===== FEATURE 2: AI GENERATION (teacher) =====
  async generateExercises(dto: GenerateExercisesDto) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: dto.topicId },
    });
    if (!topic) {
      throw new NotFoundException(`Topic with id "${dto.topicId}" not found`);
    }

    const difficulty = dto.difficulty ?? 3;
    const generated = await this.generatorService.generate({
      topic: topic.title,
      rule: dto.rule || topic.title,
      type: dto.type,
      difficulty,
      count: dto.count ?? 5,
    });

    const maxOrder = await this.prisma.exercise.aggregate({
      where: { topicId: topic.id },
      _max: { order: true },
    });
    let order = (maxOrder._max.order ?? 0) + 1;

    const created: Awaited<
      ReturnType<typeof this.prisma.exercise.create>
    >[] = [];
    for (const g of generated) {
      created.push(
        await this.prisma.exercise.create({
          data: {
            topicId: topic.id,
            type: dto.type as ExerciseType,
            prompt: g.prompt,
            payload: g.payload as Prisma.InputJsonValue,
            difficulty,
            difficultyLogit: difficultyToLogit(difficulty),
            aiGenerated: true,
            validated: false, // requires teacher approval
            order: order++,
          },
        }),
      );
    }

    return {
      generated: created.length,
      exercises: created,
      note: 'Exercises are pending validation: PATCH /teacher/exercises/:id/validate',
    };
  }
}
