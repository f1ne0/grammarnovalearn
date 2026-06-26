import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { JobsService } from './jobs.service';

/**
 * Approach 7 — async AI feedback. AiModule is @Global, so WritingAnalysisService
 * and SttService are injectable here without an explicit import.
 */
@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, JobsService],
})
export class AnalysisModule {}
