import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export interface TeacherStudent {
  id: string;
  email: string;
  fullName: string | null;
  registeredAt: string;
  averageMastery: number;
  totalSubmissions: number;
  submissionsThisWeek: number;
  lastActiveAt: string | null;
  group?: "CONTROL" | "EXPERIMENTAL";
  studyGroupId?: string | null;
}

export function useTeacherStudents(enabled = true) {
  return useQuery({
    queryKey: ["teacher-students"],
    queryFn: async () =>
      (await api.get<TeacherStudent[]>("/teacher/students")).data,
    enabled,
  });
}

export interface StudentDetail {
  student: {
    id: string;
    email: string;
    fullName: string | null;
    group?: "CONTROL" | "EXPERIMENTAL";
    studyGroupId?: string | null;
    createdAt: string;
  };
  stats: {
    totalSubmissions: number;
    correctSubmissions: number;
    accuracy: number;
  };
  mastery: {
    id: string;
    masteryPct: number;
    attempts: number;
    correct: number;
    state?: "NEW" | "LEARNING" | "PRACTICED" | "MASTERED";
    topic: { id: string; title: string; slug: string; unit: number };
  }[];
  recentSubmissions: {
    id: string;
    isCorrect: boolean;
    createdAt: string;
    exercise: { id: string; prompt: string; type: string };
    speaking: { clarity: number; grammar: number; pace: number } | null;
  }[];
}

export function useStudentDetail(id: string) {
  return useQuery({
    queryKey: ["teacher-student", id],
    queryFn: async () =>
      (await api.get<StudentDetail>(`/teacher/students/${id}`)).data,
    enabled: !!id,
  });
}

export function useSetGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      studentId,
      group,
    }: {
      studentId: string;
      group: "CONTROL" | "EXPERIMENTAL";
    }) =>
      (await api.patch(`/teacher/students/${studentId}/group`, { group }))
        .data,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["teacher-students"] });
      void qc.invalidateQueries({ queryKey: ["teacher-student"] });
    },
  });
}

// ===== GENERATOR =====
export interface GeneratedExercise {
  id: string;
  prompt: string;
  type: string;
  validated: boolean;
}

export function useGenerateExercises() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      topicId: string;
      type: string;
      count: number;
      difficulty: number;
    }) =>
      (
        await api.post<{ generated: number; exercises: GeneratedExercise[] }>(
          "/exercises/generate",
          body,
        )
      ).data,
    // Refresh the pending-validation list so new items show immediately.
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["pending-exercises"] }),
  });
}

export interface PendingExercise extends GeneratedExercise {
  difficulty: number;
  payload: import("../../exercise").ExercisePayload;
  topic: { title: string; slug: string };
}

export function usePendingExercises() {
  return useQuery({
    queryKey: ["pending-exercises"],
    queryFn: async () =>
      (await api.get<PendingExercise[]>("/teacher/exercises/pending")).data,
  });
}

export function useValidateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) =>
      (await api.patch(`/teacher/exercises/${id}/validate`, { approve }))
        .data,
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["pending-exercises"] }),
  });
}

// ===== ANALYTICS =====
export interface GroupRow {
  group: string;
  submissions: number;
  accuracy: number | null;
  avg_latency_ms: number | null;
}

export interface HeatmapRow {
  topic: string;
  category: string;
  count: number;
}

export function useGroupComparison() {
  return useQuery({
    queryKey: ["analytics-groups"],
    queryFn: async () => (await api.get<GroupRow[]>("/analytics/groups")).data,
  });
}

export function useErrorHeatmap() {
  return useQuery({
    queryKey: ["analytics-errors"],
    queryFn: async () =>
      (await api.get<HeatmapRow[]>("/analytics/errors")).data,
  });
}

export interface CurvePoint {
  day: string;
  accuracy: number;
  attempts: number;
}

export function useLearningCurve(userId: string) {
  return useQuery({
    queryKey: ["analytics-curve", userId],
    queryFn: async () =>
      (await api.get<CurvePoint[]>(`/analytics/curve/${userId}`)).data,
    enabled: !!userId,
  });
}

export async function downloadCsvExport() {
  const res = await api.get<string>("/analytics/export", {
    responseType: "text",
  });
  const contentType = String(res.headers?.["content-type"] ?? "");
  const data = res.data;
  // Guard: a JSON error body (e.g. 403 consent-gated) must not be saved as CSV.
  if (typeof data !== "string" || contentType.includes("application/json")) {
    throw new Error("Export isn't available right now. Please try again.");
  }
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "submissions.csv";
  a.click();
  URL.revokeObjectURL(url);
}
