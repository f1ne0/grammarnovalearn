import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Design system — supports light & dark.
 * Mode is toggled by adding/removing the `.dark` class on <html>
 * (see main.tsx + the theme toggle in AppShell). `base` = light, `_dark` = dark.
 */
const dual = (light: string, dark: string) => ({
  value: { base: light, _dark: dark },
});

const config = defineConfig({
  globalCss: {
    "html, body": {
      background: "var(--chakra-colors-bg)",
      color: "var(--chakra-colors-fg)",
      fontSize: "14px",
      lineHeight: "1.5",
    },
    "*::selection": { background: "rgba(79,124,255,.3)" },
    "::-webkit-scrollbar": { width: "10px", height: "10px" },
    "::-webkit-scrollbar-thumb": {
      background: "var(--chakra-colors-border-strong)",
      borderRadius: "6px",
    },
    "::-webkit-scrollbar-track": { background: "transparent" },
  },
  theme: {
    semanticTokens: {
      colors: {
        // Chakra built-ins — light page is grey so white panels stand out.
        bg: dual("#EEF0F3", "#0B0B0C"),
        fg: dual("#18181B", "#F4F4F5"),
        "bg.panel": dual("#FFFFFF", "#121214"),
        "bg.subtle": dual("#E7E9ED", "#17171A"),
        "bg.muted": dual("#E7E9ED", "#17171A"),
        "fg.muted": dual("#52525B", "#A1A1AA"),
        "fg.subtle": dual("#71717A", "#6B6B73"),

        // App tokens (referenced as color="text", bg="surface2", etc.)
        appBg: dual("#EEF0F3", "#0B0B0C"),
        surface: dual("#FFFFFF", "#121214"),
        surface2: dual("#E7E9ED", "#17171A"),
        sidebar: dual("#FFFFFF", "#0E0E10"),
        border: dual("#D5D8DF", "#232327"),
        borderStrong: dual("#BFC3CC", "#2E2E33"),
        text: dual("#18181B", "#F4F4F5"),
        textMuted: dual("#52525B", "#A1A1AA"),
        textFaint: dual("#71717A", "#6B6B73"),
        accentSubtle: dual("#E6EDFF", "#1A2238"),
      },
    },
    tokens: {
      colors: {
        // Accent + status colours read well on both modes.
        accent: { value: "#4F7CFF" },
        accentHover: { value: "#6B91FF" },
        success: { value: "#3FB950" },
        warning: { value: "#D29922" },
        error: { value: "#F85149" },
        data1: { value: "#4F7CFF" },
        data2: { value: "#3FB950" },
        data3: { value: "#D29922" },
        data4: { value: "#DB61A2" },
        data5: { value: "#2DD4BF" },
        data6: { value: "#A371F7" },
      },
      fonts: {
        body: { value: '"Geist Sans", "Geist", sans-serif' },
        heading: { value: '"Geist Sans", "Geist", sans-serif' },
        mono: { value: '"Geist Mono", monospace' },
      },
      radii: {
        sm: { value: "6px" },
        md: { value: "8px" },
        lg: { value: "10px" },
        xl: { value: "14px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
