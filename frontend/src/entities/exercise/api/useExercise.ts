import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import type { Exercise } from "../model/types";

export function useExercise(id: string) {
  return useQuery({
    queryKey: ["exercise", id],
    queryFn: async () => {
      const { data } = await api.get<Exercise>(`/exercises/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
