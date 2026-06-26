import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export interface MasteryItem {
  id: string;
  masteryPct: number;
  attempts: number;
  correct: number;
  topic: { id: string; title: string; slug: string; unit: number };
}

export interface ReviewStats {
  dueNow: number;
  totalTracked: number;
  nextReviewAt: string | null;
}

export function useMastery() {
  return useQuery({
    queryKey: ["mastery"],
    queryFn: async () => {
      const { data } = await api.get<MasteryItem[]>("/users/mastery");
      return data;
    },
  });
}

export function useReviewStats() {
  return useQuery({
    queryKey: ["review-stats"],
    queryFn: async () => {
      const { data } = await api.get<ReviewStats>("/review/stats");
      return data;
    },
  });
}

export interface SkillsProgress {
  grammar: { totalSubmissions: number; accuracy: number };
  skills: {
    reading: {
      avgComprehension: number | null;
      avgWpm: number | null;
      sessions: number;
    };
    listening: { avgComprehension: number | null; sessions: number };
    writing: { avgScore: number | null; count: number };
    speaking: { avgScore: number | null; count: number };
  };
}

export function useMyProgress() {
  return useQuery({
    queryKey: ["me-progress"],
    queryFn: async () => {
      const { data } = await api.get<SkillsProgress>("/me/progress");
      return data;
    },
  });
}

export interface ActivityDay {
  day: string;
  attempts: number;
  correct: number;
}

export interface MyActivity {
  streak: { current: number; best: number };
  days: ActivityDay[];
  accuracy: {
    value: number | null;
    prevValue: number | null;
    trendPct: number | null;
  };
}

export function useMyActivity() {
  return useQuery({
    queryKey: ["me-activity"],
    queryFn: async () => {
      const { data } = await api.get<MyActivity>("/me/activity");
      return data;
    },
  });
}
