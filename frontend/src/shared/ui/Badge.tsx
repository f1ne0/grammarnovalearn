import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";

const tones = {
  neutral: { bg: "surface2", color: "textMuted" },
  accent: { bg: "accentSubtle", color: "accentHover" },
  success: { bg: "rgba(63,185,80,.12)", color: "success" },
  warning: { bg: "rgba(210,153,34,.12)", color: "warning" },
  error: { bg: "rgba(248,81,73,.12)", color: "error" },
} as const;

export type BadgeTone = keyof typeof tones;

export const Badge = ({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) => (
  <Box
    as="span"
    display="inline-flex"
    alignItems="center"
    gap="6px"
    px="8px"
    h="22px"
    borderRadius="999px"
    fontSize="12px"
    fontWeight="500"
    whiteSpace="nowrap"
    {...tones[tone]}
  >
    {children}
  </Box>
);
