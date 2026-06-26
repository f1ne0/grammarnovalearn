/**
 * Build a multi-mode "Learn" presentation for a grammar topic. Returns blocks
 * keyed by pedagogical mode, each with Markdown content.
 */
export const buildPresentationPrompt = (title: string, readingText: string) =>
  `
You are a grammar teacher creating a multi-mode explanation for B2-level IT
students on the topic "${title}".
Reference passage (context/examples): """${readingText}"""

Produce a STRICT JSON array (no markdown fences) of explanation blocks. Use these
modes in this order, one block each:
- "FORM": how the structure is built (markdown, can use a small table or bullet list)
- "MEANING": what it expresses / when the meaning applies
- "USE": typical situations in an IT/tech workplace, with 2-3 example sentences
- "CONTRAST": how it differs from a commonly confused structure
- "ERRORS": 2-3 common mistakes B2 learners make, each with ✗ wrong → ✓ correct

Each item: {"mode":"FORM","contentMd":"...markdown..."}
Keep each block concise (<=120 words). Markdown only (headings, lists, bold).
Return ONLY the JSON array.`.trim();
