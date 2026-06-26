import { Box, Flex, Text } from "@chakra-ui/react";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Flex
      position="fixed"
      inset={0}
      zIndex={90}
      align="center"
      justify="center"
      bg="rgba(0,0,0,.6)"
      backdropFilter="blur(2px)"
      onClick={onClose}
    >
      <Box
        bg="surface"
        border="1px solid"
        borderColor="border"
        borderRadius="lg"
        p="20px"
        w="full"
        maxW="400px"
        mx="16px"
        onClick={(e) => e.stopPropagation()}
      >
        <Text fontSize="16px" fontWeight="600" color="text" mb="8px">
          {title}
        </Text>
        <Text fontSize="14px" color="textMuted" lineHeight="1.6" mb="20px">
          {body}
        </Text>
        <Flex justify="flex-end" gap="8px">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "solid"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
