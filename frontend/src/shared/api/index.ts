import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({ baseURL: API_URL });

/**
 * Wire auth into the api instance. Called once from the app layer
 * (shared must not import entities — FSD).
 */
export function setupApiAuth(opts: {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokens: (accessToken: string, refreshToken: string) => void;
  onUnauthorized: () => void;
}) {
  api.interceptors.request.use((config) => {
    const token = opts.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  let refreshing: Promise<boolean> | null = null;

  const tryRefresh = async (): Promise<boolean> => {
    const refreshToken = opts.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${API_URL}/auth/refresh`, { refreshToken });
      opts.onTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const url: string = error.config?.url ?? "";
      const config = error.config;

      if (status === 401 && !url.startsWith("/auth") && config && !config._retried) {
        refreshing ??= tryRefresh().finally(() => {
          refreshing = null;
        });
        const ok = await refreshing;
        if (ok) {
          config._retried = true;
          return api(config);
        }
        opts.onUnauthorized();
      }
      return Promise.reject(error);
    },
  );
}

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(". ");
    if (typeof msg === "string") return msg;
    return error.message;
  }
  return "Something went wrong";
}
