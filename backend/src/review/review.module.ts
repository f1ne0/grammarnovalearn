import { Module } from '@nestjs/common';
import { Sm2Service } from './sm2.service';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  controllers: [ReviewController],
  providers: [Sm2Service, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
