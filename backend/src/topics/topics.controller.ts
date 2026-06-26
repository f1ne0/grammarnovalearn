import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Res,
  ServiceUnavailableException,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { TopicsService } from './topics.service';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';
import { JwtGuard } from '../common/guards/jwt.guard';
import { TeacherGuard } from '../common/guards/teacher.guard';
import {
  CreateTopicDto,
  GenerateReadingDto,
  UpdateTopicDto,
} from './dto/topic.dto';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  async getAllTopics(@CurrentUser() user?: JwtUser) {
    return this.topicsService.getAllTopics(user?.sub);
  }

  @Get(':slug/audio')
  async getTopicAudio(
    @Param('slug') slug: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const wav = await this.topicsService.getTopicAudio(slug);
      // Set audio headers only on success (errors must stay JSON)
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return new StreamableFile(wav);
    } catch (e) {
      if (e instanceof HttpException) throw e; // e.g. 404 topic not found
      throw new ServiceUnavailableException(
        'Audio generation is temporarily unavailable. Please try again in a minute.',
      );
    }
  }

  // Approach 1: multi-mode presentation (ось A)
  @Get(':slug/presentations')
  async getPresentations(@Param('slug') slug: string) {
    return this.topicsService.getPresentations(slug);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtGuard)
  async getTopicBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: JwtUser,
  ) {
    return this.topicsService.getTopicBySlug(slug, user?.sub);
  }

  // ===== TEACHER: content management =====
  @Post('generate-reading')
  @UseGuards(JwtGuard, TeacherGuard)
  async generateReading(@Body() dto: GenerateReadingDto) {
    return this.topicsService.generateReadingText(dto.title);
  }

  @Post(':slug/presentations/generate')
  @UseGuards(JwtGuard, TeacherGuard)
  async generatePresentation(@Param('slug') slug: string) {
    return this.topicsService.generatePresentation(slug);
  }

  @Post()
  @UseGuards(JwtGuard, TeacherGuard)
  async createTopic(@Body() dto: CreateTopicDto) {
    return this.topicsService.createTopic(dto);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, TeacherGuard)
  async updateTopic(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.updateTopic(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, TeacherGuard)
  async deleteTopic(@Param('id') id: string) {
    return this.topicsService.deleteTopic(id);
  }
}
