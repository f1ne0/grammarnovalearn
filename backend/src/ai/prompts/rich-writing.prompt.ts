/**
 * Approach 7 — richer writing rubric. In addition to grammar errors, estimate
 * CEFR level and rate vocabulary range, coherence, and task achievement, and
 * offer a model rewrite. Used by the async analysis job.
 */
export const buildRichWritingPrompt = (text: string, taskPrompt?: string) =>
  `
You are an English writing examiner for IT students at B2 level.
${taskPrompt ? `The writing task was: """${taskPrompt}"""` : ''}
Analyze the student's text below.

Text: """${text}"""

Return STRICT JSON only (no markdown fences):
{
  "errors": [
    {
      "type": "tense|article|agreement|preposition|word-order|spelling|vocabulary|punctuation|other",
      "original": "exact erroneous substring copied verbatim from the text",
      "correction": "corrected version",
      "explanation": "<=25 words",
      "startIndex": <int char offset of original>,
      "endIndex": <int char offset of end>
    }
  ],
  "overallFeedback": "<=60 words, encouraging and specific",
  "grammarScore": <0-100 integer>,
  "cefr": "A1|A2|B1|B2|C1|C2",
  "vocabularyScore": <0-100 integer, range and precision of word choice>,
  "coherenceScore": <0-100 integer, logical flow, linking, paragraphing>,
  "taskAchievement": <0-100 integer, how fully the task is addressed; if no task given, judge completeness>,
  "strengths": ["<short phrase>", "<short phrase>"],
  "rewrite": "An improved B2/C1 model version of the student's text, same meaning, 1-2 short paragraphs."
}
If there are no grammar errors, return an empty errors array and grammarScore 100.
`.trim();
