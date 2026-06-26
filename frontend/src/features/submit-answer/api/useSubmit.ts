import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export interface SubmissionResult {
  id: string;
  isCorrect: boolean;
  feedback: string;
  errorCategory?: string;
  createdAt: string;
}

export interface SpeakingResult extends SubmissionResult {
  transcript: string;
  scores: { clarity: number; grammar: number; pace: number; total: number };
}

function useInvalidateProgress() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["topics"] });
    void qc.invalidateQueries({ queryKey: ["topic"] });
    void qc.invalidateQueries({ queryKey: ["mastery"] });
    void qc.invalidateQueries({ queryKey: ["review-stats"] });
  };
}

export function useSubmitAnswer() {
  const invalidate = useInvalidateProgress();
  return useMutation({
    mutationFn: async (body: {
      exerciseId: string;
      answer: Record<string, unknown>;
      responseTimeMs?: number;
    }) => {
      const { data } = await api.post<SubmissionResult>("/submissions", body);
      return data;
    },
    onSuccess: invalidate,
  });
}

export function useSubmitSpeaking() {
  const invalidate = useInvalidateProgress();
  return useMutation({
    mutationFn: async ({
      exerciseId,
      blob,
      mimeType,
    }: {
      exerciseId: string;
      blob: Blob;
      mimeType: string;
    }) => {
      const form = new FormData();
      form.append("exerciseId", exerciseId);
      const ext = mimeType.includes("webm") ? "webm" : "wav";
      form.append("audio", blob, `recording.${ext}`);
      const { data } = await api.post<SpeakingResult>(
        "/submissions/audio",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    onSuccess: invalidate,
  });
}
