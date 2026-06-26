import { Box, Flex, Text } from "@chakra-ui/react";
import { TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  trend?: string;
}) {
  return (
    <Box
      bg="surface"
      border="1px solid"
      borderColor="border"
      borderRadius="lg"
      p="20px"
      transition="border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease"
      _hover={{
        borderColor: "borderStrong",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(0,0,0,.12)",
      }}
    >
      <Flex justify="space-between" align="center" mb="10px">
        <Text fontSize="13px" color="textMuted" fontWeight="500">
          {label}
        </Text>
        {Icon && <Icon size={16} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />}
      </Flex>
      <Text
        fontFamily="mono"
        fontSize="32px"
        fontWeight="600"
        lineHeight="1.1"
        color="text"
      >
        {value}
      </Text>
      {(sub || trend) && (
        <Flex align="center" gap="6px" mt="8px">
          {trend && (
            <>
              <TrendingUp size={13} strokeWidth={1.5} color="#3FB950" />
              <Text fontSize="12px" color="success">
                {trend}
              </Text>
            </>
          )}
          {sub && (
            <Text fontSize="12px" color="textFaint">
              {sub}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
}
