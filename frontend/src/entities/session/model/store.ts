import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "STUDENT" | "TEACHER";

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName?: string | null;
  group?: "CONTROL" | "EXPERIMENTAL";
  createdAt?: string;
}

interface SessionState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "grammar-auth" },
  ),
);
