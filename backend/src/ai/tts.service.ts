import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const SAMPLE_RATE = 24000; // Gemini TTS outputs 24kHz 16-bit mono PCM

@Injectable()
export class TtsService {
  private client: GoogleGenAI;
  private logger = new Logger('TtsService');

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  get defaultVoice(): string {
    return this.configService.get<string>('TTS_VOICE') || 'Sulafat';
  }

  /**
   * Synthesize speech for the given text. Returns a WAV buffer.
   * Voice options: https://ai.google.dev/gemini-api/docs/speech-generation#voices
   */
  async synthesize(text: string, voice?: string): Promise<Buffer> {
    const voiceName = voice || this.defaultVoice;

    const prompt = `Read the following text aloud clearly and naturally, at a moderate pace suitable for B2-level English learners:\n\n${text}`;

    // Gemini TTS occasionally returns 500 INTERNAL — retry up to 3 times
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model: TTS_MODEL,
          contents: [{ parts: [{ text: prompt }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const data =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!data) {
          throw new Error('TTS returned no audio data');
        }

        const pcm = Buffer.from(data, 'base64');
        this.logger.log(
          `✅ TTS generated: ${pcm.length} bytes PCM (${voiceName}, attempt ${attempt})`,
        );
        return this.pcmToWav(pcm);
      } catch (e) {
        lastError = e;
        this.logger.warn(
          `TTS attempt ${attempt}/3 failed: ${String(e).slice(0, 200)}`,
        );
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, attempt * 1500));
        }
      }
    }
    throw lastError;
  }

  /** Wrap raw 16-bit mono PCM in a WAV container. */
  private pcmToWav(
    pcm: Buffer,
    sampleRate = SAMPLE_RATE,
    channels = 1,
    bitDepth = 16,
  ): Buffer {
    const byteRate = (sampleRate * channels * bitDepth) / 8;
    const blockAlign = (channels * bitDepth) / 8;
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcm.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitDepth, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcm.length, 40);

    return Buffer.concat([header, pcm]);
  }
}
