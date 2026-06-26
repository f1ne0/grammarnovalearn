import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api";

export type MasteryState = "NEW" | "LEARNING" | "PRACTICED" | "MASTERED";

export interface ReviewTopic {
  slug: string;
  title: string;
  unit: number;
  masteryPct: number;
  state: MasteryState;
  reviewCount: number;
  nextReviewAt: string | null;
}

export interface ReviewsResponse {
  dueNow: ReviewTopic[];
  upcoming: ReviewTopic[];
  nextReviewAt: string | null;
}

export function useReviews() {
  return useQuery({
    queryKey: ["me-reviews"],
    queryFn: async () =>
      (await api.get<ReviewsResponse>("/me/reviews")).data,
  });
}
