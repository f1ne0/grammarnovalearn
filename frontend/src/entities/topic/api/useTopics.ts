import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import type { TopicDetail, TopicListItem } from "../model/types";

export interface TopicInput {
  title: string;
  slug: string;
  unit: number;
  order: number;
  readingText: string;
}

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data } = await api.get<TopicListItem[]>("/topics");
      return data;
    },
  });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: ["topic", slug],
    queryFn: async () => {
      const { data } = await api.get<TopicDetail>(`/topics/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

// ===== TEACHER: content management =====
export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TopicInput) =>
      (await api.post("/topics", body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Partial<TopicInput>) =>
      (await api.patch(`/topics/${id}`, body)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/topics/${id}`)).data,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useGenerateReadingText() {
  return useMutation({
    mutationFn: async (title: string) =>
      (
        await api.post<{ readingText: string }>("/topics/generate-reading", {
          title,
        })
      ).data,
  });
}
