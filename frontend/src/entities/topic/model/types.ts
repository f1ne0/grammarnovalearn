import type { ExerciseSummary } from "../../exercise";

export interface TopicListItem {
  id: string;
  slug: string;
  title: string;
  unit: number;
  order: number;
  readingText: string;
  exerciseCount: number;
  masteryPct: number;
}

export interface TopicDetail {
  id: string;
  slug: string;
  title: string;
  unit: number;
  order: number;
  readingText: string;
  exercises: ExerciseSummary[];
  masteryPct: number;
}
