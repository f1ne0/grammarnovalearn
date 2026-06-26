import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdaptiveService } from './adaptive.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('adaptive')
export class AdaptiveController {
  constructor(private adaptiveService: AdaptiveService) {}

  @Get('next')
  @UseGuards(JwtGuard)
  async next(
    @CurrentUser() user: JwtUser,
    @Query('topicId') topicId: string,
  ) {
    if (!topicId) {
      throw new BadRequestException('topicId query parameter is required');
    }
    const exercise = await this.adaptiveService.nextExercise(
      user.sub,
      topicId,
    );
    return { exercise }; // null = topic exhausted
  }
}
