import { useMutation } from "@tanstack/react-query";
import { api } from "../../../shared/api";
import { useSessionStore } from "../../../entities/session";
import type { User } from "../../../entities/session";

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export function useLogin() {
  const setAuth = useSessionStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await api.post<AuthResponse>("/auth/login", body);
      return data;
    },
    onSuccess: (data) =>
      setAuth(data.user, data.accessToken, data.refreshToken),
  });
}

export function useRegister() {
  const setAuth = useSessionStore((s) => s.setAuth);
  return useMutation({
    mutationFn: async (body: {
      email: string;
      password: string;
      inviteCode: string;
    }) => {
      const { data } = await api.post<AuthResponse>("/auth/register", body);
      return data;
    },
    onSuccess: (data) =>
      setAuth(data.user, data.accessToken, data.refreshToken),
  });
}
