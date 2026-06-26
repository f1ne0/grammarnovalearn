import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class SubmitExerciseDto {
  @IsString()
  exerciseId: string;

  @IsObject()
  answer: Record<string, unknown>;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeMs?: number;
}
