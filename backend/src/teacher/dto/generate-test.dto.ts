import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

enum TestTypeDto {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  DELAYED_POST = 'DELAYED_POST',
  QUIZ = 'QUIZ',
}

export class GenerateTestDto {
  @IsString()
  title: string;

  @IsEnum(TestTypeDto)
  type: 'PRE_TEST' | 'POST_TEST' | 'DELAYED_POST' | 'QUIZ';

  @IsString()
  topicId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  count?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMin?: number;
}
