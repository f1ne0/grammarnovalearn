export interface SeedExercise {
  type:
    | "MULTIPLE_CHOICE"
    | "FILL_IN_BLANK"
    | "MATCHING"
    | "TRUE_FALSE"
    | "REORDER"
    | "SPEAKING";
  prompt: string;
  payload: Record<string, unknown>;
  difficulty: number; // 1-5
}

export interface SeedTopic {
  slug: string;
  title: string;
  order: number; // within unit
  readingText: string;
  exercises: SeedExercise[];
}

export interface SeedUnit {
  unit: number;
  title: string;
  topics: SeedTopic[];
}
