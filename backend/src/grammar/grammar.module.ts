import { Module } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { GradingService } from './grading.service';
import { GrammarController } from './grammar.controller';

@Module({
  controllers: [GrammarController],
  providers: [GrammarService, GradingService],
})
export class GrammarModule {}
