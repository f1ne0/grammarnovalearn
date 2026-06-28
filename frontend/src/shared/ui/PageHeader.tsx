import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  breadcrumb,
  actions,
}: {
  title: string;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Box
      borderBottom="1px solid"
      borderColor="border"
      px={{ base: "16px", md: "32px" }}
      py="20px"
      bg="bg"
    >
      {breadcrumb && (
        <Box mb="6px" fontSize="13px" color="textFaint">
          {breadcrumb}
        </Box>
      )}
      <Flex justify="space-between" align="center" gap="16px" wrap="wrap">
        <Text
          fontSize="28px"
          fontWeight="600"
          letterSpacing="-0.02em"
          color="text"
        >
          {title}
        </Text>
        {actions && (
          <Flex gap="10px" wrap="wrap">
            {actions}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
