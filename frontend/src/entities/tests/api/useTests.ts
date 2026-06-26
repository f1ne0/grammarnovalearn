import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import type { ExercisePayload, ExerciseType } from "../../exercise";

export type TestType = "PRE_TEST" | "POST_TEST" | "DELAYED_POST" | "QUIZ";

export interface TestSummary {
  id: string;
  title: string;
  type: TestType;
  topicIds: string[];
  durationMin: number | null;
  createdAt: string;
  questionCount: number;
  /** Student view: the student's best completed attempt (null if not taken). */
  attempt?: { score: number; completedAt: string } | null;
  /** Teacher view: aggregate completed-attempt stats. */
  attempts?: number;
  avgScore?: number | null;
}

export interface TestSolution {
  correctAnswerId: string | null;
  correctAnswers: string[] | null;
  correctAnswer: boolean | null;
  explanation: string | null;
}

export interface TestQuestion {
  id: string;
  type: ExerciseType;
  prompt: string;
  payload: ExercisePayload; // answers stripped by backend
}

export interface TestDetail extends TestSummary {
  questions: TestQuestion[];
}

export interface TestResult {
  id: string;
  score: number;
  correct: number;
  total: number;
  detailed: {
    exerciseId: string;
    isCorrect: boolean;
    solution?: TestSolution;
  }[];
}

export function useTests() {
  return useQuery({
    queryKey: ["tests"],
    queryFn: async () => (await api.get<TestSummary[]>("/tests")).data,
  });
}

export function useTest(id: string) {
  return useQuery({
    queryKey: ["test", id],
    queryFn: async () => (await api.get<TestDetail>(`/tests/${id}`)).data,
    enabled: !!id,
  });
}

export function useStartAttempt() {
  return useMutation({
    mutationFn: async (testId: string) =>
      (await api.post<{ id: string }>(`/tests/${testId}/start`)).data,
  });
}

export function useSubmitAttempt() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: { exerciseId: string; answer: Record<string, unknown> }[];
    }) =>
      (
        await api.post<TestResult>(`/tests/attempts/${attemptId}/submit`, {
          answers,
        })
      ).data,
  });
}

// ===== TEACHER: CREATE TEST =====
export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      type: TestType;
      topicIds: string[];
      questionIds: string[];
      durationMin?: number;
    }) => (await api.post("/teacher/tests", body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useGenerateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string;
      type: TestType;
      topicId: string;
      difficulty?: number;
      count?: number;
      durationMin?: number;
    }) => (await api.post<TestSummary>("/teacher/tests/generate", body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useUpdateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      type?: TestType;
      topicIds?: string[];
      questionIds?: string[];
      durationMin?: number;
    }) => (await api.patch(`/teacher/tests/${id}`, body)).data,
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["tests"] });
      void qc.invalidateQueries({ queryKey: ["test", vars.id] });
    },
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.delete(`/teacher/tests/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["tests"] }),
  });
}

export function useTopicExercises(topicId: string) {
  return useQuery({
    queryKey: ["topic-exercises", topicId],
    queryFn: async () =>
      (
        await api.get<
          { id: string; type: string; prompt: string; difficulty: number }[]
        >("/exercises", { params: { topicId } })
      ).data,
    enabled: !!topicId,
  });
}
