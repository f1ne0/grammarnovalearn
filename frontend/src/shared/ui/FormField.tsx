import { Box, Input, Text } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

interface FormFieldProps extends ComponentProps<typeof Input> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, error, ...inputProps }, ref) {
    return (
      <Box w="full">
        <Text
          as="label"
          display="block"
          fontSize="13px"
          fontWeight="500"
          mb="6px"
          color="textMuted"
        >
          {label}
        </Text>
        <Input
          ref={ref}
          bg="surface"
          color="text"
          fontSize="14px"
          border="1px solid"
          borderColor={error ? "error" : "border"}
          borderRadius="md"
          transition="border-color 160ms ease"
          _placeholder={{ color: "textFaint" }}
          _hover={{ borderColor: error ? "error" : "borderStrong" }}
          _focusVisible={{
            borderColor: "accent",
            boxShadow: "0 0 0 1px #4F7CFF",
            outline: "none",
          }}
          {...inputProps}
        />
        {error && (
          <Text fontSize="12px" color="error" mt="4px">
            {error}
          </Text>
        )}
      </Box>
    );
  },
);
