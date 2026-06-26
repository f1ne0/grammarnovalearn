import { Box, Flex, Text } from "@chakra-ui/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { create } from "zustand";

interface ToastItem {
  id: number;
  kind: "success" | "error";
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (kind: ToastItem["kind"], message: string) => void;
  remove: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(
      () => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      kind === "error" ? 4000 : 2500,
    );
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative API: notify.success("Saved") / notify.error("Failed") */
export const notify = {
  success: (m: string) => useToastStore.getState().push("success", m),
  error: (m: string) => useToastStore.getState().push("error", m),
};

/** Mount once in the app shell. */
export function Toaster() {
  const { toasts, remove } = useToastStore();
  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={100}>
      <Flex direction="column" gap="8px" align="flex-end">
        {toasts.map((t) => (
          <Flex
            key={t.id}
            align="center"
            gap="10px"
            bg="surface2"
            border="1px solid"
            borderColor={
              t.kind === "success"
                ? "rgba(63,185,80,.35)"
                : "rgba(248,81,73,.35)"
            }
            borderRadius="md"
            px="14px"
            py="10px"
            boxShadow="0 4px 12px rgba(0,0,0,.4)"
            cursor="pointer"
            onClick={() => remove(t.id)}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={16} strokeWidth={1.5} color="#3FB950" />
            ) : (
              <XCircle size={16} strokeWidth={1.5} color="#F85149" />
            )}
            <Text fontSize="13px" color="text">
              {t.message}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
