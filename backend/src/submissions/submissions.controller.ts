import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseFilePipe,
  ParseIntPipe,
  MaxFileSizeValidator,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { SubmissionsService } from './submissions.service';
import { SubmitExerciseDto } from './dto/submit-exercise.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('submissions')
export class SubmissionsController {
  constructor(private submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } }) // AI cost control
  async submitExercise(
    @CurrentUser() user: JwtUser,
    @Body() submitExerciseDto: SubmitExerciseDto,
  ) {
    return this.submissionsService.submitExercise(user.sub, submitExerciseDto);
  }

  /**
   * Speaking exercise: multipart/form-data with
   * - field "audio": audio file (wav/mp3/webm/ogg, max 10MB)
   * - field "exerciseId": SPEAKING exercise id
   */
  @Post('audio')
  @UseGuards(JwtGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // AI cost control
  @UseInterceptors(FileInterceptor('audio'))
  async submitAudio(
    @CurrentUser() user: JwtUser,
    @Body('exerciseId') exerciseId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!exerciseId) {
      throw new BadRequestException('exerciseId field is required');
    }

    const allowedTypes = [
      'audio/wav',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/aac',
      'audio/flac',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported audio type "${file.mimetype}". Allowed: ${allowedTypes.join(', ')}`,
      );
    }

    return this.submissionsService.submitSpeakingExercise(
      user.sub,
      exerciseId,
      file.buffer,
      file.mimetype,
    );
  }

  @Get()
  @UseGuards(JwtGuard)
  async getSubmissions(
    @CurrentUser() user: JwtUser,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.submissionsService.getUserSubmissions(user.sub, page, limit);
  }
}
