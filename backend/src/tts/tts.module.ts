import { Module } from '@nestjs/common';
import { TtsController } from './tts.controller';

// TtsService is provided globally by AiModule.
@Module({
  controllers: [TtsController],
})
export class TtsModule {}
