import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

enum GeneratableType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  TRUE_FALSE = 'TRUE_FALSE',
}

export class GenerateExercisesDto {
  @IsString()
  topicId: string;

  @IsEnum(GeneratableType)
  type: GeneratableType;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  difficulty?: number = 3;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  count?: number = 5;

  @IsString()
  @IsOptional()
  rule?: string; // grammar focus; defaults to topic title
}
