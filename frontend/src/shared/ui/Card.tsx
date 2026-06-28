import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

/** Titled panel with optional header action. */
export function Card({
  title,
  action,
  children,
  noPadding,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}) {
  return (
    <Box bg="surface" border="1px solid" borderColor="border" borderRadius="lg">
      {title && (
        <Flex
          justify="space-between"
          align="center"
          gap="12px"
          flexWrap="wrap"
          px="20px"
          py="14px"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Text
            fontSize="15px"
            fontWeight="600"
            color="text"
            flex="1 1 auto"
            minW="100px"
            lineClamp={1}
          >
            {title}
          </Text>
          {action && <Box flexShrink={0}>{action}</Box>}
        </Flex>
      )}
      <Box p={noPadding ? 0 : "20px"}>{children}</Box>
    </Box>
  );
}
