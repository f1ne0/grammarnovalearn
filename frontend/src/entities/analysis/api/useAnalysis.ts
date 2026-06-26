import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import type { WritingError } from "../../skills";

export type JobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface RichWritingAnalysis {
  errors: WritingError[];
  overallFeedback: string;
  grammarScore: number;
  cefr: string;
  vocabularyScore: number;
  coherenceScore: number;
  taskAchievement: number;
  strengths: string[];
  rewrite: string;
  submissionId: string;
}

export interface RichSpeakingEvaluation {
  transcript: string;
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  relevance: number;
  feedback: string;
  tips: string[];
}

export interface AnalysisJob<T> {
  id: string;
  kind: "WRITING" | "SPEAKING";
  status: JobStatus;
  result: T | null;
  error: string | null;
}

export function useEnqueueWriting() {
  return useMutation({
    mutationFn: async (body: {
      writingTaskId: string;
      text: string;
      responseTimeMs?: number;
    }) => (await api.post<{ jobId: string }>("/analysis/writing", body)).data,
  });
}

export function useEnqueueSpeaking() {
  return useMutation({
    mutationFn: async ({
      blob,
      mimeType,
      prompt,
      example,
    }: {
      blob: Blob;
      mimeType: string;
      prompt: string;
      example?: string;
    }) => {
      const form = new FormData();
      const ext = mimeType.includes("webm") ? "webm" : "wav";
      form.append("audio", blob, `speech.${ext}`);
      form.append("prompt", prompt);
      if (example) form.append("example", example);
      return (
        await api.post<{ jobId: string }>("/analysis/speaking", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data;
    },
  });
}

/** Polls a job every 2s until it reaches DONE/FAILED. */
export function useAnalysisJob<T>(jobId: string | null) {
  return useQuery({
    queryKey: ["analysis-job", jobId],
    enabled: !!jobId,
    queryFn: async () =>
      (await api.get<AnalysisJob<T>>(`/analysis/${jobId}`)).data,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === "DONE" || s === "FAILED" ? false : 2000;
    },
  });
}
