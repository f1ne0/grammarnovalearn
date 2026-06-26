export const buildFeedbackPrompt = (p: {
  prompt: string;
  studentAnswer: string;
  correctAnswer: string;
  rule: string;
  isCorrect: boolean;
}) =>
  `
You are an English grammar tutor for B2-level IT students.
Exercise: "${p.prompt}"
Student answered: "${p.studentAnswer}"
Correct answer: "${p.correctAnswer}"
The answer is ${p.isCorrect ? 'CORRECT' : 'INCORRECT'} (verified — do not dispute).
Grammar rule: "${p.rule}"

Return STRICT JSON (no markdown fences):
{
  "errorCategory": "tense | article | agreement | preposition | word-order | other | none",
  "feedback": "<=60 words. If wrong: name the error type, explain the rule, give the fix. If right: confirm and reinforce why."
}
`.trim();
