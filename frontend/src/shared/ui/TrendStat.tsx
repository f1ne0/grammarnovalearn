import { Box, Flex, Text } from "@chakra-ui/react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TrendStatProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trendPct?: number | null;
  /** When true, a downward trend is good (e.g. latency) → green. */
  lowerIsBetter?: boolean;
}

export function TrendStat({
  label,
  value,
  icon: Icon,
  trendPct,
  lowerIsBetter,
}: TrendStatProps) {
  const hasTrend = trendPct !== null && trendPct !== undefined && trendPct !== 0;
  const up = (trendPct ?? 0) > 0;
  const good = lowerIsBetter ? !up : up;
  const color = !hasTrend ? "textFaint" : good ? "success" : "error";
  // Arrow reflects good/bad, not the raw numeric direction: an improvement
  // always points up (e.g. faster response time = up + green).
  const TrendIcon = !hasTrend ? Minus : good ? TrendingUp : TrendingDown;
  const pct = Math.abs(trendPct ?? 0);
  const trendText = !hasTrend
    ? "no change"
    : lowerIsBetter
      ? `${pct}% ${up ? "slower" : "faster"}`
      : `${up ? "+" : "−"}${pct}%`;

  return (
    <Box
      bg="surface"
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      p="20px"
      transition="border-color 160ms ease"
      _hover={{ borderColor: "borderStrong" }}
    >
      <Flex justify="space-between" align="center" mb="10px">
        <Text fontSize="13px" color="textMuted" fontWeight="500">
          {label}
        </Text>
        {Icon && <Icon size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />}
      </Flex>
      <Text fontFamily="mono" fontSize="32px" fontWeight="600" lineHeight="1.1" color="text">
        {value}
      </Text>
      <Flex align="center" gap="5px" mt="8px">
        <Box color={color}>
          <TrendIcon size={13} strokeWidth={1.5} />
        </Box>
        <Text fontSize="12px" color={color}>
          {trendText}
        </Text>
        <Text fontSize="12px" color="textFaint">
          vs prev period
        </Text>
      </Flex>
    </Box>
  );
}
