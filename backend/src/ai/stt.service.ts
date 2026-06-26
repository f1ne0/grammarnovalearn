import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const STT_MODEL = 'gemini-2.5-flash';

export interface SpeakingEvaluation {
  clarity: number; // 0-5
  grammar: number; // 0-5
  pace: number; // 0-5
  feedback: string;
}

/** Approach 7 — richer speaking rubric evaluated directly from the audio. */
export interface RichSpeakingEvaluation {
  transcript: string;
  fluency: number; // 0-5
  grammar: number; // 0-5
  vocabulary: number; // 0-5
  pronunciation: number; // 0-5
  relevance: number; // 0-5
  feedback: string;
  tips: string[];
}

@Injectable()
export class SttService {
  private client: GoogleGenAI;
  private logger = new Logger('SttService');

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  // ===== TRANSCRIBE AUDIO =====
  async transcribeAudio(
    audioBuffer: Buffer,
    mimeType = 'audio/wav',
  ): Promise<string> {
    const response = await this.client.models.generateContent({
      model: STT_MODEL,
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBuffer.toString('base64'),
              },
            },
            {
              text: 'Transcribe this audio exactly as spoken. Return ONLY the transcript text, nothing else. If the audio contains no speech, return "[no speech detected]".',
            },
          ],
        },
      ],
    });

    const transcript = (response.text ?? '').trim();
    this.logger.log(`✅ Audio transcribed (${transcript.length} chars)`);
    return transcript;
  }

  // ===== EVALUATE SPEAKING =====
  async evaluateSpeaking(
    transcript: string,
    prompt: string,
    example?: string,
  ): Promise<SpeakingEvaluation> {
    const message = `
You are an English speaking teacher for IT students (B2 level).

Speaking exercise: "${prompt}"
${example ? `Good example answer: "${example}"` : ''}
Student's transcribed speech: "${transcript}"

Evaluate the student's response on a 0-5 scale for each criterion:
1. clarity: How clear and understandable was the speech?
2. grammar: Grammar accuracy of what was said.
3. pace: Was the response complete and appropriately detailed for the task?

Respond with ONLY valid JSON, no markdown fences:
{"clarity": <0-5>, "grammar": <0-5>, "pace": <0-5>, "feedback": "<2-4 sentences of specific, encouraging feedback>"}
    `.trim();

    const response = await this.client.models.generateContent({
      model: STT_MODEL,
      contents: [{ parts: [{ text: message }] }],
    });

    const responseText = response.text ?? '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.error(`❌ Could not parse evaluation: ${responseText}`);
      throw new Error('Could not parse speaking evaluation');
    }

    const parsed = JSON.parse(jsonMatch[0]) as Partial<SpeakingEvaluation>;

    const clamp = (n: unknown) =>
      Math.max(0, Math.min(5, Math.round(Number(n) || 0)));

    const evaluation: SpeakingEvaluation = {
      clarity: clamp(parsed.clarity),
      grammar: clamp(parsed.grammar),
      pace: clamp(parsed.pace),
      feedback: String(parsed.feedback ?? 'Keep practicing!'),
    };

    this.logger.log('✅ Speaking evaluated');
    return evaluation;
  }

  // ===== APPROACH 7: RICH EVALUATION FROM AUDIO (one multimodal call) =====
  async evaluateRichFromAudio(
    audioBuffer: Buffer,
    mimeType: string,
    prompt: string,
    example?: string,
  ): Promise<RichSpeakingEvaluation> {
    const instructions = `
You are an English speaking examiner for IT students (B2 level).
Listen to the attached audio and assess the spoken answer.

Speaking task: "${prompt}"
${example ? `Reference good answer: "${example}"` : ''}

Transcribe what was said, then rate each criterion on a 0-5 scale:
- fluency: smoothness, pace, absence of long hesitations
- grammar: accuracy of structures used
- vocabulary: range and precision of word choice
- pronunciation: intelligibility and accuracy of sounds/stress (judge from the audio)
- relevance: how well the answer addresses the task

Respond with ONLY valid JSON, no markdown fences:
{"transcript":"<verbatim transcript>","fluency":<0-5>,"grammar":<0-5>,"vocabulary":<0-5>,"pronunciation":<0-5>,"relevance":<0-5>,"feedback":"<2-4 sentences, specific and encouraging>","tips":["<actionable tip>","<actionable tip>"]}
If there is no speech, set every score to 0 and transcript to "[no speech detected]".`.trim();

    const response = await this.client.models.generateContent({
      model: STT_MODEL,
      contents: [
        {
          parts: [
            { inlineData: { mimeType, data: audioBuffer.toString('base64') } },
            { text: instructions },
          ],
        },
      ],
    });

    const responseText = response.text ?? '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.error(`❌ Could not parse rich evaluation: ${responseText}`);
      throw new Error('Could not parse speaking evaluation');
    }
    const p = JSON.parse(jsonMatch[0]) as Partial<RichSpeakingEvaluation>;
    const clamp = (n: unknown) =>
      Math.max(0, Math.min(5, Math.round(Number(n) || 0)));

    const result: RichSpeakingEvaluation = {
      transcript: String(p.transcript ?? '').trim() || '[no speech detected]',
      fluency: clamp(p.fluency),
      grammar: clamp(p.grammar),
      vocabulary: clamp(p.vocabulary),
      pronunciation: clamp(p.pronunciation),
      relevance: clamp(p.relevance),
      feedback: String(p.feedback ?? 'Keep practicing!'),
      tips: Array.isArray(p.tips)
        ? p.tips.filter((t) => typeof t === 'string').slice(0, 4)
        : [],
    };
    this.logger.log('✅ Speaking richly evaluated');
    return result;
  }
}
