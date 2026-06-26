import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  name: string;
}

export class RenameGroupDto {
  @IsString()
  name: string;
}

export class GroupSettingsDto {
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  unlockedUnits?: number[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  weakThreshold?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  atRiskThreshold?: number;
}

export class AssignStudentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  studentIds: string[];
}
