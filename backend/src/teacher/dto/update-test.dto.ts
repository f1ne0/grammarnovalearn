import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

enum TestTypeDto {
  PRE_TEST = 'PRE_TEST',
  POST_TEST = 'POST_TEST',
  DELAYED_POST = 'DELAYED_POST',
  QUIZ = 'QUIZ',
}

export class UpdateTestDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(TestTypeDto)
  @IsOptional()
  type?: 'PRE_TEST' | 'POST_TEST' | 'DELAYED_POST' | 'QUIZ';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topicIds?: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  questionIds?: string[];

  @IsInt()
  @Min(1)
  @IsOptional()
  durationMin?: number;
}
