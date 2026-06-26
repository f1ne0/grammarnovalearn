import { Button as ChakraButton, Spinner } from "@chakra-ui/react";
import type { ButtonProps as ChakraButtonProps } from "@chakra-ui/react";

type Variant = "solid" | "outline" | "ghost" | "subtle" | "danger";

const variants: Record<Variant, ChakraButtonProps> = {
  solid: {
    bg: "accent",
    color: "white",
    _hover: { bg: "accentHover" },
  },
  outline: {
    bg: "transparent",
    color: "text",
    border: "1px solid",
    borderColor: "border",
    _hover: { bg: "surface2", borderColor: "borderStrong" },
  },
  ghost: {
    bg: "transparent",
    color: "textMuted",
    _hover: { bg: "surface2", color: "text" },
  },
  subtle: {
    bg: "accentSubtle",
    color: "accentHover",
    _hover: { bg: "#222C49" },
  },
  danger: {
    bg: "rgba(248,81,73,.12)",
    color: "error",
    _hover: { bg: "rgba(248,81,73,.2)" },
  },
};

export interface ButtonProps extends Omit<ChakraButtonProps, "variant"> {
  variant?: Variant;
  loading?: boolean;
}

/** Kit button: 160ms transitions, hairline outline variant. */
export function Button({
  variant = "solid",
  loading,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <ChakraButton
      h="38px"
      px="16px"
      fontSize="14px"
      fontWeight="500"
      borderRadius="md"
      transition="all 160ms ease"
      disabled={disabled || loading}
      {...variants[variant]}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </ChakraButton>
  );
}
