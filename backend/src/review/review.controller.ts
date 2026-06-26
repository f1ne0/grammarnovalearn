import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import {
  CurrentUser,
  JwtUser,
} from '../common/decorators/current-user.decorator';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('queue')
  @UseGuards(JwtGuard)
  async getQueue(@CurrentUser() user: JwtUser) {
    return this.reviewService.getReviewQueue(user.sub);
  }

  @Get('stats')
  @UseGuards(JwtGuard)
  async getStats(@CurrentUser() user: JwtUser) {
    return this.reviewService.getReviewStats(user.sub);
  }
}
