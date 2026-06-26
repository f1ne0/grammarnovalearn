import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ExerciseType } from '@prisma/client';

export class CreateExerciseDto {
  @IsString()
  topicId: string;

  @IsEnum(ExerciseType)
  type: ExerciseType;

  @IsString()
  prompt: string;

  @IsObject()
  payload: Record<string, unknown>;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @IsNumber()
  @IsOptional()
  order?: number;
}
