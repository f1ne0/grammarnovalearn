import { Global, Module } from '@nestjs/common';
import { GeminiClient } from './gemini.client';
import { FeedbackService } from './feedback.service';
import { GeneratorService } from './generator.service';
import { WritingAnalysisService } from './writing-analysis.service';
import { GeminiService } from './gemini.service';
import { SttService } from './stt.service';
import { TtsService } from './tts.service';

@Global()
@Module({
  providers: [
    GeminiClient,
    FeedbackService,
    GeneratorService,
    WritingAnalysisService,
    GeminiService,
    SttService,
    TtsService,
  ],
  exports: [
    GeminiClient,
    FeedbackService,
    GeneratorService,
    WritingAnalysisService,
    GeminiService,
    SttService,
    TtsService,
  ],
})
export class AiModule {}
