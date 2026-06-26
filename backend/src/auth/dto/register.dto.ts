import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(6)
  inviteCode: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  /** Research consent; without it the user's data is excluded from export. */
  @IsBoolean()
  @IsOptional()
  consent?: boolean;
}
