import { Flex, Text } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Flex direction="column" align="center" justify="center" py="48px" gap="10px">
      {Icon && <Icon size={28} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />}
      <Text fontSize="15px" fontWeight="500" color="text">
        {title}
      </Text>
      {description && (
        <Text fontSize="13px" color="textFaint" textAlign="center" maxW="360px">
          {description}
        </Text>
      )}
      {action}
    </Flex>
  );
}
