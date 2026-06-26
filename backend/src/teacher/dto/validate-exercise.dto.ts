import { IsBoolean } from 'class-validator';

export class ValidateExerciseDto {
  @IsBoolean()
  approve: boolean;
}
