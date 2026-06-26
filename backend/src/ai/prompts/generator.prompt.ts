export const buildGeneratorPrompt = (p: {
  topic: string;
  rule: string;
  type: string;
  difficulty: number;
  count: number;
}) =>
  `
Generate ${p.count} ${p.type} exercises for B2-level IT students on "${p.topic}".
Grammar focus: "${p.rule}". Difficulty (1-5): ${p.difficulty}.
Use a VARIED IT/tech context — rotate across: software development, databases,
mobile apps, web/UX, cybersecurity, cloud, AI/ML, QA/testing, project management,
DevOps, tech interviews, careers. Do NOT make every item about a server going
down or a deployment — vary the subjects, situations and vocabulary so the set
feels diverse. Variation seed: ${Math.random().toString(36).slice(2)}.

Return a STRICT JSON array (no markdown fences). Each item:
- For MULTIPLE_CHOICE:
{"prompt":"the question with _____ blank","payload":{"options":[{"id":"a","text":"..."},{"id":"b","text":"..."},{"id":"c","text":"..."},{"id":"d","text":"..."}],"correctAnswerId":"b","explanation":"why this is correct"}}
- For FILL_IN_BLANK:
{"prompt":"the question","payload":{"text":"sentence with _____","correctAnswers":["answer1","acceptable alternative"],"explanation":"..."}}
- For TRUE_FALSE:
{"prompt":"the statement","payload":{"correctAnswer":true,"explanation":"..."}}

Make every exercise grammatically unambiguous with exactly one correct answer.
`.trim();
