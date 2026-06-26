import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class AnalyzeWritingDto {
  @IsString()
  writingTaskId: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  text: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeMs?: number;
}
