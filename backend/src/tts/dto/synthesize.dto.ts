import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SynthesizeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000, { message: 'Text must be at most 2000 characters' })
  text: string;

  @IsString()
  @IsOptional()
  voice?: string;
}
