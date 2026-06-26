import { Box, Flex, Text } from "@chakra-ui/react";

function colorFor(value: number): string {
  if (value <= 25) return "#EF4444";
  if (value <= 50) return "#F59E0B";
  if (value <= 75) return "#EAB308";
  return "#10B981";
}

interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  height?: string;
}

export function ProgressBar({
  value,
  showLabel = false,
  height = "8px",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <Box w="full">
      {showLabel && (
        <Flex justify="space-between" mb="4px">
          <Text fontSize="13px" color="#6B7280">
            Mastery
          </Text>
          <Text fontSize="13px" fontWeight="600" color={colorFor(pct)}>
            {pct}%
          </Text>
        </Flex>
      )}
      <Box bg="#E5E7EB" borderRadius="full" h={height} overflow="hidden">
        <Box
          bg={colorFor(pct)}
          h="full"
          borderRadius="full"
          width={`${pct}%`}
          transition="width 0.6s ease-in-out"
        />
      </Box>
    </Box>
  );
}
