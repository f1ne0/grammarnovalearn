import { IsInt, IsOptional, IsString, Matches, Min, MinLength } from 'class-validator';

export class GenerateReadingDto {
  @IsString()
  @MinLength(2)
  title: string;
}

export class CreateTopicDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase words separated by hyphens',
  })
  slug: string;

  @IsInt()
  @Min(1)
  unit: number;

  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  readingText: string;
}

export class UpdateTopicDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase words separated by hyphens',
  })
  @IsOptional()
  slug?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  unit?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  readingText?: string;
}
