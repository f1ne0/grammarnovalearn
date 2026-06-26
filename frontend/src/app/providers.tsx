import { ChakraProvider } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { system } from "../shared/config/theme";
import { queryClient } from "../shared/lib/queryClient";
import { setupApiAuth } from "../shared/api";
import { useSessionStore } from "../entities/session";

// Wire auth into the shared api instance (app layer owns composition)
setupApiAuth({
  getToken: () => useSessionStore.getState().accessToken,
  getRefreshToken: () => useSessionStore.getState().refreshToken,
  onTokens: (accessToken, refreshToken) =>
    useSessionStore.getState().setTokens(accessToken, refreshToken),
  onUnauthorized: () => useSessionStore.getState().logout(),
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  );
}
