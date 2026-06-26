import { Module } from '@nestjs/common';
import { AdaptiveService } from './adaptive.service';
import { AdaptiveController } from './adaptive.controller';

@Module({
  controllers: [AdaptiveController],
  providers: [AdaptiveService],
  exports: [AdaptiveService],
})
export class AdaptiveModule {}
