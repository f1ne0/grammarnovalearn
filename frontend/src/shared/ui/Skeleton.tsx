import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { BoxProps } from "@chakra-ui/react";

const shimmer = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

/** Shimmer placeholder on surface2. */
export function Skeleton(props: BoxProps) {
  return (
    <Box
      borderRadius="md"
      bg="surface2"
      position="relative"
      overflow="hidden"
      css={{
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
          animation: `${shimmer} 1.4s infinite`,
        },
      }}
      {...props}
    />
  );
}
