import { Box, Flex, Text } from "@chakra-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Themed dropdown (button + popover) that matches the dark UI kit.
 * Replaces native <select>, whose OS-rendered control/list clashes with the
 * rest of the interface.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  width,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  width?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <Box position="relative" w={width ?? "full"}>
      <Flex
        as="button"
        align="center"
        justify="space-between"
        gap="8px"
        w="full"
        h="38px"
        px="12px"
        bg="surface"
        border="1px solid"
        borderColor={open ? "accent" : "border"}
        borderRadius="md"
        fontSize="14px"
        color={current ? "text" : "textFaint"}
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        transition="border-color 160ms ease"
        _hover={disabled ? {} : { borderColor: "borderStrong" }}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <Text lineClamp={1}>{current?.label ?? placeholder}</Text>
        <Box
          color="var(--chakra-colors-text-faint)"
          flexShrink={0}
          transform={open ? "rotate(180deg)" : undefined}
          transition="transform 160ms ease"
        >
          <ChevronDown size={16} strokeWidth={1.5} />
        </Box>
      </Flex>

      {open && (
        <>
          <Box
            position="fixed"
            inset={0}
            zIndex={19}
            onClick={() => setOpen(false)}
          />
          <Box
            position="absolute"
            top="calc(100% + 6px)"
            left={0}
            right={0}
            zIndex={20}
            maxH="260px"
            overflowY="auto"
            bg="surface"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            boxShadow="0 8px 24px rgba(0,0,0,.4)"
            py="4px"
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <Flex
                  key={o.value}
                  as="button"
                  w="full"
                  align="center"
                  justify="space-between"
                  gap="8px"
                  px="12px"
                  py="8px"
                  textAlign="left"
                  fontSize="14px"
                  color={selected ? "text" : "textMuted"}
                  bg={selected ? "surface2" : "transparent"}
                  transition="background 120ms ease"
                  _hover={{ bg: "surface2", color: "text" }}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Text lineClamp={1}>{o.label}</Text>
                  {selected && (
                    <Check size={14} strokeWidth={1.5} color="#4F7CFF" />
                  )}
                </Flex>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
