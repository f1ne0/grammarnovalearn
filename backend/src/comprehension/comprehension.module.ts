import { Module } from '@nestjs/common';
import { ComprehensionService } from './comprehension.service';

@Module({
  providers: [ComprehensionService],
  exports: [ComprehensionService],
})
export class ComprehensionModule {}
