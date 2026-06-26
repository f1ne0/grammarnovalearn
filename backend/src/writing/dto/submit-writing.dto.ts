import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SubmitWritingDto {
  @IsString()
  writingTaskId: string;

  @IsString()
  @MinLength(10, { message: 'Text is too short' })
  @MaxLength(5000, { message: 'Text is too long (max 5000 chars)' })
  text: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeMs?: number;
}
