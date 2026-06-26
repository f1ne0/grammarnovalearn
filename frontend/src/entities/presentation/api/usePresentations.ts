import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export type PresentationMode =
  | "DISCOVERY"
  | "FORM"
  | "MEANING"
  | "USE"
  | "VISUAL"
  | "CONTRAST"
  | "CONTEXT"
  | "ERRORS";

export interface PresentationBlock {
  id: string;
  mode: PresentationMode;
  order: number;
  contentMd: string;
  payload: {
    type?: string;
    points?: { label: string; at: number }[];
    note?: string;
    pairs?: { a: string; b: string; whyA: string; whyB: string }[];
    items?: { wrong: string; right: string; reason: string }[];
  } | null;
}

export interface PresentationsResponse {
  topic: { title: string };
  blocks: PresentationBlock[];
}

export function usePresentations(slug: string) {
  return useQuery({
    queryKey: ["presentations", slug],
    queryFn: async () =>
      (await api.get<PresentationsResponse>(`/topics/${slug}/presentations`))
        .data,
    enabled: !!slug,
  });
}

export function useGeneratePresentation(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await api.post<{ generated: number }>(
        `/topics/${slug}/presentations/generate`,
      )).data,
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["presentations", slug] }),
  });
}
