import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { TtsService } from '../ai/tts.service';
import { SynthesizeDto } from './dto/synthesize.dto';
import { JwtGuard } from '../common/guards/jwt.guard';

@Controller('tts')
export class TtsController {
  constructor(private ttsService: TtsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'audio/wav')
  @Header('Cache-Control', 'no-store')
  async synthesize(@Body() dto: SynthesizeDto): Promise<StreamableFile> {
    const wav = await this.ttsService.synthesize(dto.text, dto.voice);
    return new StreamableFile(wav);
  }
}
