import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import type {
  ExercisePayload,
  ExerciseType,
} from "../../../entities/exercise";
import type { PresentationBlock } from "../../../entities/presentation";

export type TopicState = "mastered" | "current" | "available" | "locked";

export interface GrammarTopic {
  id: string;
  slug: string;
  title: string;
  order: number;
  exerciseCount: number;
  hasPresentation: boolean;
  masteryPct: number;
  state: TopicState;
}

export interface GrammarUnit {
  unit: number;
  avgMastery: number;
  topics: GrammarTopic[];
}

export interface GrammarReference {
  id: string;
  slug: string;
  title: string;
  unit: number;
  readingText: string;
  presentations: PresentationBlock[];
  masteryPct: number;
  _count: { exercises: number };
}

export interface DrillExercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  payload: ExercisePayload;
  difficulty: number;
}

export function useGrammarLibrary() {
  return useQuery({
    queryKey: ["grammar-library"],
    queryFn: async () =>
      (await api.get<{ units: GrammarUnit[] }>("/grammar")).data,
  });
}

export function useGrammarReference(slug: string) {
  return useQuery({
    queryKey: ["grammar-reference", slug],
    queryFn: async () =>
      (await api.get<GrammarReference>(`/grammar/${slug}`)).data,
    enabled: !!slug,
  });
}

export async function fetchDrills(slug: string, n = 10) {
  const { data } = await api.get<DrillExercise[]>(`/grammar/${slug}/drills`, {
    params: { n },
  });
  return data;
}

// ===== Approach 5: knowledge check =====
export interface CheckQuestion {
  id: string;
  type: ExerciseType;
  prompt: string;
  payload: ExercisePayload;
}

export interface CheckResult {
  score: number;
  correct: number;
  total: number;
  passed: boolean;
  verdict: string;
  nextReviewAt: string | null;
  detailed: { exerciseId: string; isCorrect: boolean }[];
}

export async function fetchKnowledgeCheck(slug: string) {
  const { data } = await api.get<{
    topic: { title: string };
    questions: CheckQuestion[];
  }>(`/grammar/${slug}/check`);
  return data;
}

export async function submitKnowledgeCheck(
  slug: string,
  answers: { exerciseId: string; answer: Record<string, unknown> }[],
) {
  const { data } = await api.post<CheckResult>(`/grammar/${slug}/check`, {
    answers,
  });
  return data;
}
