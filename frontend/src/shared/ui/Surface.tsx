import { Box } from "@chakra-ui/react";
import type { BoxProps } from "@chakra-ui/react";

/** Base panel: surface bg + hairline border. */
export const Surface = (p: BoxProps) => (
  <Box
    bg="surface"
    border="1px solid"
    borderColor="border"
    borderRadius="lg"
    p="20px"
    {...p}
  />
);
