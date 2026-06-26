import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  topicIds: string[];

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
