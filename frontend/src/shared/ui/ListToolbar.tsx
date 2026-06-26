import { Flex, Input, Text } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Select } from "./Select";

export function ListToolbar({
  search,
  onSearch,
  placeholder = "Search...",
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode; // filter/sort selects
}) {
  return (
    <Flex gap="10px" align="center" mb="16px" wrap="wrap">
      <Flex position="relative" maxW="280px" w="full" align="center">
        <Flex position="absolute" left="10px" pointerEvents="none">
          <Search size={15} strokeWidth={1.5} color="var(--chakra-colors-text-faint)" />
        </Flex>
        <Input
          pl="34px"
          h="36px"
          bg="surface"
          color="text"
          fontSize="14px"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          _placeholder={{ color: "textFaint" }}
          _hover={{ borderColor: "borderStrong" }}
          _focusVisible={{
            borderColor: "accent",
            boxShadow: "0 0 0 1px #4F7CFF",
            outline: "none",
          }}
        />
      </Flex>
      {children}
    </Flex>
  );
}

/** Themed select (custom dropdown) to match the kit. */
export function ToolbarSelect({
  value,
  onChange,
  options,
  width = "170px",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}) {
  return (
    <Select value={value} onChange={onChange} options={options} width={width} />
  );
}

export function Pagination({
  total,
  limit,
  offset,
  onChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onChange: (offset: number) => void;
}) {
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <Flex justify="space-between" align="center" px="16px" py="12px">
      <Text fontFamily="mono" fontSize="12px" color="textFaint">
        {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </Text>
      <Flex gap="6px">
        <Button
          variant="outline"
          h="30px"
          px="10px"
          fontSize="13px"
          disabled={page <= 1}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft size={14} strokeWidth={1.5} />
          Prev
        </Button>
        <Button
          variant="outline"
          h="30px"
          px="10px"
          fontSize="13px"
          disabled={page >= pages}
          onClick={() => onChange(offset + limit)}
        >
          Next
          <ChevronRight size={14} strokeWidth={1.5} />
        </Button>
      </Flex>
    </Flex>
  );
}
