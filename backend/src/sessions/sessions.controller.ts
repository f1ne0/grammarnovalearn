import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  Allow,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SessionsService } from './sessions.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

class ComprehensionAnswerDto {
  @IsString()
  questionId: string;

  /** Option id (string) for MC, boolean for TRUE_FALSE. */
  @Allow()
  value: string | boolean;
}

class CompleteReadingDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  comprehensionScore?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  readingTimeMs?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComprehensionAnswerDto)
  @IsOptional()
  answers?: ComprehensionAnswerDto[];
}

class CompleteListeningDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  playCount?: number;

  @IsNumber()
  @Min(0.25)
  @Max(2)
  @IsOptional()
  playbackSpeed?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  comprehensionScore?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComprehensionAnswerDto)
  @IsOptional()
  answers?: ComprehensionAnswerDto[];
}

@Controller()
@UseGuards(JwtGuard)
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  // ===== READING =====
  @Post('reading/:slug/start')
  async startReading(@CurrentUser() user: JwtUser, @Param('slug') slug: string) {
    return this.sessionsService.startReading(user.sub, slug);
  }

  @Get('reading/:slug/comprehension')
  async readingComprehension(@Param('slug') slug: string) {
    return this.sessionsService.questions(slug, 'reading');
  }

  @Post('reading/sessions/:id/complete')
  async completeReading(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CompleteReadingDto,
  ) {
    return this.sessionsService.completeReading(user.sub, id, {
      comprehensionScore: dto.comprehensionScore,
      readingTimeMs: dto.readingTimeMs,
      answers: dto.answers,
    });
  }

  // ===== LISTENING =====
  @Post('listening/:slug/start')
  async startListening(
    @CurrentUser() user: JwtUser,
    @Param('slug') slug: string,
  ) {
    return this.sessionsService.startListening(user.sub, slug);
  }

  @Get('listening/:slug/comprehension')
  async listeningComprehension(@Param('slug') slug: string) {
    return this.sessionsService.questions(slug, 'listening');
  }

  @Post('listening/sessions/:id/complete')
  async completeListening(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: CompleteListeningDto,
  ) {
    return this.sessionsService.completeListening(user.sub, id, dto);
  }
}
