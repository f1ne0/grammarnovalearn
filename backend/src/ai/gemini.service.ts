import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-2.5-flash';

@Injectable()
export class GeminiService {
  private client: GoogleGenerativeAI;
  private logger = new Logger('GeminiService');

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  // ===== GENERATE FEEDBACK =====
  async generateExerciseFeedback(
    studentAnswer: string,
    correctAnswer: string,
    prompt: string,
    explanation: string,
    isCorrect: boolean,
  ): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: GEMINI_MODEL });

      const message = `
You are an English grammar teacher for IT students (B2 level).

Exercise: "${prompt}"
Student's answer: "${studentAnswer}"
Correct answer: "${correctAnswer}"
The student's answer is ${isCorrect ? 'CORRECT' : 'INCORRECT'} (already verified — do not dispute this).
Grammar rule: "${explanation}"

Provide brief feedback:
1. ${isCorrect ? 'Confirm the answer is correct and praise briefly.' : "Explain the student's mistake."}
2. Explain the rule in simple terms.

Keep response under 150 words.
      `.trim();

      const result = await model.generateContent(message);
      const feedback = result.response.text();

      this.logger.log('✅ Feedback generated');
      return feedback;
    } catch (error) {
      this.logger.error('❌ Error generating feedback', error);
      // Fallback response
      return `Your answer: "${studentAnswer}". Correct answer: "${correctAnswer}". ${explanation}`;
    }
  }

  // ===== EXPLAIN EXERCISE =====
  async explainExercise(prompt: string, explanation: string): Promise<string> {
    try {
      const model = this.client.getGenerativeModel({ model: GEMINI_MODEL });

      const message = `
You are an English grammar teacher for IT students (B2 level).

Exercise: "${prompt}"
Grammar rule: "${explanation}"

Provide a clear explanation of this exercise with:
1. The grammar rule
2. Why this rule applies here
3. An example

Keep it concise (under 200 words).
      `.trim();

      const result = await model.generateContent(message);
      const explainText = result.response.text();

      this.logger.log('✅ Explanation generated');
      return explainText;
    } catch (error) {
      this.logger.error('❌ Error generating explanation', error);
      return explanation;
    }
  }
}
