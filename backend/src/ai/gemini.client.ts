import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const TEXT_MODEL = 'gemini-2.5-flash';

/**
 * Low-level Gemini wrapper: timeout, single retry, JSON parsing,
 * audio transcription. All AI services go through this client.
 */
@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private readonly client: GoogleGenAI;

  constructor(config: ConfigService) {
    const apiKey = config.get<string>('GOOGLE_API_KEY');
    if (!apiKey) throw new Error('GOOGLE_API_KEY is not set');
    this.client = new GoogleGenAI({ apiKey });
  }

  /** Generate text with timeout + one retry. */
  async generateText(
    prompt: string,
    timeoutMs = 8000,
    maxOutputTokens = 2048,
    temperature = 0.4,
  ): Promise<string> {
    const attempt = async () => {
      const response = await this.withTimeout(
        this.client.models.generateContent({
          model: TEXT_MODEL,
          contents: [{ parts: [{ text: prompt }] }],
          config: { temperature, maxOutputTokens },
        }),
        timeoutMs,
      );
      return response.text ?? '';
    };
    try {
      return await attempt();
    } catch (e) {
      this.logger.warn(`Gemini retry after error: ${String(e)}`);
      return await attempt(); // single retry
    }
  }

  /**
   * Generate and parse JSON. Strips code fences, repairs trailing commas, and
   * regenerates once if the model returns malformed JSON (which happens
   * occasionally, especially for longer array outputs).
   */
  async generateJson<T>(
    prompt: string,
    timeoutMs = 10000,
    maxOutputTokens = 2048,
    temperature = 0.4,
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await this.generateText(
        prompt,
        timeoutMs,
        maxOutputTokens,
        temperature,
      );
      try {
        return this.parseJson<T>(raw);
      } catch (e) {
        lastErr = e;
        this.logger.warn(
          `JSON parse failed (attempt ${attempt + 1}/2): ${String(e)}`,
        );
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new Error('Invalid JSON from Gemini');
  }

  private parseJson<T>(raw: string): T {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/[[{][\s\S]*[}\]]/);
    if (!match) throw new Error('No JSON found in Gemini response');
    // Repair common model slips: trailing commas before } or ].
    const repaired = match[0].replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(repaired) as T;
  }

  /** Multimodal: audio in, transcript out. */
  async transcribeAudio(
    audioBase64: string,
    mimeType: string,
    timeoutMs = 20000,
  ): Promise<string> {
    const response = await this.withTimeout(
      this.client.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: audioBase64 } },
              {
                text: 'Transcribe this speech verbatim. Return ONLY the transcript. If there is no speech, return "[no speech detected]".',
              },
            ],
          },
        ],
      }),
      timeoutMs,
    );
    return (response.text ?? '').trim();
  }

  private withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error('Gemini timeout')), ms),
      ),
    ]);
  }
}
