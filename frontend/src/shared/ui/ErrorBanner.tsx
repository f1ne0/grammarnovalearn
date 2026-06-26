import { Flex, Text } from "@chakra-ui/react";
import { Button } from "./Button";

/** Friendly, non-technical error bar with an optional retry action.
 *  Pair it with the page's loading skeleton so the layout keeps its shape. */
export function ErrorBanner({
  message = "We couldn't load this right now. Please check your internet connection and try again.",
  onRetry,
  loading,
}: {
  message?: string;
  onRetry?: () => void;
  loading?: boolean;
}) {
  return (
    <Flex
      align="center"
      justify="space-between"
      gap="12px"
      wrap="wrap"
      bg="rgba(248,81,73,.08)"
      border="1px solid"
      borderColor="rgba(248,81,73,.25)"
      borderRadius="md"
      p="12px 16px"
      mb="20px"
    >
      <Text fontSize="13px" color="text">
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="outline"
          h="32px"
          px="12px"
          fontSize="13px"
          loading={loading}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </Flex>
  );
}
