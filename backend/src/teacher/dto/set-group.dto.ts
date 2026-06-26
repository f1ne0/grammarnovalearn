import { IsEnum } from 'class-validator';

enum StudyGroupDto {
  CONTROL = 'CONTROL',
  EXPERIMENTAL = 'EXPERIMENTAL',
}

export class SetGroupDto {
  @IsEnum(StudyGroupDto)
  group: 'CONTROL' | 'EXPERIMENTAL';
}
