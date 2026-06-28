import { Box, Flex, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function DataTable<T>({
  columns,
  rows,
  renderCell,
  onRowClick,
  maxBodyHeight = "560px",
}: {
  columns: { key: string; label: string; w?: string | number }[];
  rows: T[];
  renderCell: (row: T, key: string) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Fixed max height for the scrollable body. */
  maxBodyHeight?: string | number;
}) {
  // ONE scroll container for both axes. A previous version nested a separate
  // vertical-scroll area inside a horizontal-scroll box; because setting
  // overflow-y:auto also makes overflow-x compute to auto, the inner area
  // trapped horizontal gestures and the table couldn't scroll sideways.
  return (
    <Box maxH={maxBodyHeight} overflow="auto" overscrollBehavior="contain">
      <Box minW="640px">
        <Flex
          px="16px"
          py="10px"
          borderBottom="1px solid"
          borderColor="border"
          position="sticky"
          top={0}
          zIndex={1}
          bg="surface"
        >
          {columns.map((c) => (
            <Text
              key={c.key}
              flex={c.w ?? 1}
              fontSize="12px"
              fontWeight="500"
              color="textFaint"
              textTransform="uppercase"
              letterSpacing="0.03em"
            >
              {c.label}
            </Text>
          ))}
        </Flex>
        {rows.map((row, i) => (
          <Flex
            key={i}
            px="16px"
            py="12px"
            borderBottom="1px solid"
            borderColor="border"
            transition="background 120ms ease"
            _hover={{ bg: "surface2" }}
            fontSize="14px"
            color="text"
            align="center"
            cursor={onRowClick ? "pointer" : undefined}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            {columns.map((c) => (
              <Box key={c.key} flex={c.w ?? 1} minW={0}>
                {renderCell(row, c.key)}
              </Box>
            ))}
          </Flex>
        ))}
      </Box>
    </Box>
  );
}
