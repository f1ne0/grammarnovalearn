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
          px="20px"
          py="14px"
          borderBottom="1px solid"
          borderColor="border"
        >
          <Text fontSize="15px" fontWeight="600" color="text">
            {title}
          </Text>
          {action}
        </Flex>
      )}
      <Box p={noPadding ? 0 : "20px"}>{children}</Box>
    </Box>
  );
}
