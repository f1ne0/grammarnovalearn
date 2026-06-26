import { Box, Flex, Text } from "@chakra-ui/react";

/** Thin accent-filled progress bar. */
export function Progress({
  value,
  showLabel = false,
}: {
  value: number;
  showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <Box w="full">
      {showLabel && (
        <Flex justify="space-between" mb="6px">
          <Text fontSize="12px" color="textFaint">
            Mastery
          </Text>
          <Text fontSize="12px" fontFamily="mono" color="textMuted">
            {pct}%
          </Text>
        </Flex>
      )}
      <Box h="6px" bg="surface2" borderRadius="999px" overflow="hidden">
        <Box
          h="100%"
          w={`${pct}%`}
          bg="accent"
          borderRadius="999px"
          transition="width 400ms ease"
        />
      </Box>
    </Box>
  );
}
