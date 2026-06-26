export const buildWritingPrompt = (text: string) =>
  `
Analyze this B2-level text written by an IT student. Find grammar errors only.
Text: """${text}"""

Return STRICT JSON (no markdown fences):
{
  "errors": [
    {
      "type": "tense|article|agreement|preposition|word-order|spelling|other",
      "original": "exact erroneous substring copied from the text",
      "correction": "corrected version",
      "explanation": "<=25 words",
      "startIndex": <integer char offset of original in text>,
      "endIndex": <integer char offset of the end>
    }
  ],
  "overallFeedback": "<=50 words, encouraging and specific",
  "grammarScore": <0-100 integer>
}
If there are no errors, return an empty errors array and score 100.
`.trim();
