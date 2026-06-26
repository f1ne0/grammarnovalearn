import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AnalysisService } from './analysis.service';
import { AnalyzeWritingDto } from './dto/analyze-writing.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

/**
 * Approach 7 — async AI feedback for writing & speaking.
 * Each POST returns a `{ jobId }`; poll `GET /analysis/:jobId` until DONE.
 */
@Controller('analysis')
@UseGuards(JwtGuard)
export class AnalysisController {
  constructor(private analysis: AnalysisService) {}

  @Post('writing')
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // AI cost control
  async writing(@CurrentUser() user: JwtUser, @Body() dto: AnalyzeWritingDto) {
    return this.analysis.enqueueWriting(user.sub, {
      writingTaskId: dto.writingTaskId,
      text: dto.text,
      responseTimeMs: dto.responseTimeMs,
    });
  }

  @Post('speaking')
  @Throttle({ default: { ttl: 60_000, limit: 8 } }) // AI cost control
  @UseInterceptors(FileInterceptor('audio'))
  speaking(
    @CurrentUser() user: JwtUser,
    @Body('prompt') prompt: string,
    @Body('example') example: string | undefined,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    audio: Express.Multer.File,
  ) {
    return this.analysis.enqueueSpeaking(user.sub, {
      audio: audio.buffer,
      mimeType: audio.mimetype || 'audio/webm',
      prompt: prompt || 'Speak about the topic.',
      example,
    });
  }

  @Get(':jobId')
  status(@CurrentUser() user: JwtUser, @Param('jobId') jobId: string) {
    return this.analysis.get(jobId, user.sub);
  }
}
