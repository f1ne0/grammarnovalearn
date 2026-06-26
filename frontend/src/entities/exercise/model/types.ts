export type ExerciseType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_BLANK"
  | "MATCHING"
  | "TRUE_FALSE"
  | "REORDER"
  | "SPEAKING"
  // Approach 2 (ось B): deterministic cognitive modes
  | "OPEN_CLOZE"
  | "WORD_FORMATION"
  | "KEY_WORD_TRANSFORMATION"
  | "ERROR_CORRECTION"
  | "CATEGORIZE";

export interface ExerciseSummary {
  id: string;
  type: ExerciseType;
  prompt: string;
  difficulty: number;
  order: number;
}

export interface ExercisePayload {
  options?: { id: string; text: string }[];
  correctAnswerId?: string;
  text?: string;
  correctAnswers?: string[];
  correctAnswer?: boolean;
  left?: { id: string; text: string }[];
  right?: { id: string; text: string }[];
  pairs?: [string, string][];
  words?: string[];
  correctOrder?: string[];
  example?: string;
  explanation?: string;
  // Approach 2 payload fields
  root?: string;
  original?: string;
  keyword?: string;
  prompt2?: string;
  items?: { id: string; text: string }[];
  categories?: { id: string; label: string }[];
}

export interface Exercise extends ExerciseSummary {
  topicId: string;
  payload: ExercisePayload;
}

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  FILL_IN_BLANK: "Fill in the blank",
  MATCHING: "Matching",
  TRUE_FALSE: "True / False",
  REORDER: "Reorder words",
  SPEAKING: "Speaking",
  OPEN_CLOZE: "Open cloze",
  WORD_FORMATION: "Word formation",
  KEY_WORD_TRANSFORMATION: "Key-word transformation",
  ERROR_CORRECTION: "Error correction",
  CATEGORIZE: "Categorize",
};

/** Cognitive mode label (Approach 2 — ось B). */
export const COGNITIVE_MODE: Partial<Record<ExerciseType, string>> = {
  MULTIPLE_CHOICE: "Recognise",
  TRUE_FALSE: "Recognise",
  MATCHING: "Recognise",
  CATEGORIZE: "Recognise",
  FILL_IN_BLANK: "Recall",
  OPEN_CLOZE: "Recall",
  WORD_FORMATION: "Produce",
  REORDER: "Produce",
  KEY_WORD_TRANSFORMATION: "Transform",
  ERROR_CORRECTION: "Correct",
  SPEAKING: "Produce",
};
