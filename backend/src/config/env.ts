import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
  validateSync,
} from "class-validator";

enum Environment {
  Development = "development",
  Production = "production",
  Test = "test",
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  API_PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  @MinLength(32, { message: "JWT_SECRET must be at least 32 characters" })
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRY: string = "24h";

  @IsString()
  REFRESH_TOKEN_EXPIRY: string = "7d";

  @IsNumber()
  INVITE_CODE_LENGTH: number = 8;

  @IsNumber()
  INVITE_EXPIRY_DAYS: number = 30;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  GOOGLE_API_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}

export const config = {
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  port: parseInt(process.env.API_PORT || "3000", 10),
};
