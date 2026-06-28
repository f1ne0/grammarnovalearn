import { useQuery } from "@tanstack/react-query";
import { api } from "../../shared/api";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  exercises: number;
  accuracy: number;
  isMe: boolean;
}

export interface LeaderboardResponse {
  hasGroup: boolean;
  groupName: string | null;
  entries: LeaderboardEntry[];
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["me-leaderboard"],
    queryFn: async () =>
      (await api.get<LeaderboardResponse>("/me/leaderboard")).data,
  });
}
