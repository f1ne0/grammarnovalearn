import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WritingService } from './writing.service';
import { SubmitWritingDto } from './dto/submit-writing.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('writing')
@UseGuards(JwtGuard)
export class WritingController {
  constructor(private writingService: WritingService) {}

  @Get('topic/:slug')
  async getTasks(@Param('slug') slug: string) {
    return this.writingService.getTasksByTopic(slug);
  }

  @Post('submit')
  @Throttle({ default: { ttl: 60_000, limit: 10 } }) // AI cost control
  async submit(@CurrentUser() user: JwtUser, @Body() dto: SubmitWritingDto) {
    return this.writingService.submit(user.sub, dto);
  }
}
