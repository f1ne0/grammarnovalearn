import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";

// ===== WRITING =====
export interface WritingTask {
  id: string;
  prompt: string;
  minWords: number;
  maxWords: number;
}

export interface WritingError {
  type: string;
  original: string;
  correction: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface WritingAnalysis {
  id?: string;
  errors: WritingError[];
  overallFeedback: string;
  grammarScore: number;
}

export function useWritingTasks(slug: string) {
  return useQuery({
    queryKey: ["writing-tasks", slug],
    queryFn: async () => {
      const { data } = await api.get<WritingTask[]>(`/writing/topic/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useSubmitWriting() {
  return useMutation({
    mutationFn: async (body: {
      writingTaskId: string;
      text: string;
      responseTimeMs?: number;
    }) => {
      const { data } = await api.post<WritingAnalysis>(
        "/writing/submit",
        body,
      );
      return data;
    },
  });
}

// ===== READING / LISTENING SESSIONS =====
interface SessionRef {
  id: string;
}

// ===== Approach 6: comprehension checks =====
export type CompChannel = "reading" | "listening";

export interface CompQuestion {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  prompt: string;
  options?: { id: string; text: string }[];
}

export interface CompAnswer {
  questionId: string;
  value: string | boolean;
}

export interface CompDetail {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string | boolean;
  explanation?: string;
}

export interface CompGraded {
  score: number;
  correct: number;
  total: number;
  detailed: CompDetail[];
}

export async function fetchComprehension(slug: string, channel: CompChannel) {
  const { data } = await api.get<CompQuestion[]>(
    `/${channel}/${slug}/comprehension`,
  );
  return data;
}

export function useReadingSession() {
  const start = useMutation({
    mutationFn: async (slug: string) =>
      (await api.post<SessionRef>(`/reading/${slug}/start`)).data,
  });
  const complete = useMutation({
    mutationFn: async ({
      sessionId,
      answers,
      readingTimeMs,
    }: {
      sessionId: string;
      answers?: CompAnswer[];
      readingTimeMs?: number;
    }) =>
      (
        await api.post<{
          wpm: number | null;
          readingTimeMs: number;
          comprehension: CompGraded | null;
        }>(`/reading/sessions/${sessionId}/complete`, {
          answers,
          readingTimeMs,
        })
      ).data,
  });
  return { start, complete };
}

export function useListeningSession() {
  const start = useMutation({
    mutationFn: async (slug: string) =>
      (await api.post<SessionRef>(`/listening/${slug}/start`)).data,
  });
  const complete = useMutation({
    mutationFn: async ({
      sessionId,
      playCount,
      playbackSpeed,
      answers,
    }: {
      sessionId: string;
      playCount: number;
      playbackSpeed: number;
      answers?: CompAnswer[];
    }) =>
      (
        await api.post<{ comprehension: CompGraded | null }>(
          `/listening/sessions/${sessionId}/complete`,
          { playCount, playbackSpeed, answers },
        )
      ).data,
  });
  return { start, complete };
}

// ===== ADAPTIVE =====
export interface AdaptiveNext {
  exercise: {
    id: string;
    type: string;
    prompt: string;
    difficulty: number;
  } | null;
}

export async function fetchAdaptiveNext(topicId: string) {
  const { data } = await api.get<AdaptiveNext>("/adaptive/next", {
    params: { topicId },
  });
  return data;
}
