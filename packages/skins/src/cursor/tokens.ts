import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

export interface CursorColors {
  bg: string;
  header: string;
  border: string;
  text: string;
  dim: string;
  userBg: string;
  userBorder: string;
  codeBg: string;
  codeText: string;
  accent: string;
  composerBg: string;
  composerBorder: string;
  placeholder: string;
  chipBg: string;
  link: string;
}

export const CURSOR_COLORS: Record<ResolvedTheme, CursorColors> = {
  dark: {
    bg: "#1a1a1a",
    header: "#1a1a1a",
    border: "#2d2d2d",
    text: "#d4d4d4",
    dim: "#858585",
    userBg: "#262626",
    userBorder: "#333333",
    codeBg: "#2a2a2a",
    codeText: "#ce9178",
    accent: "#4d9fff",
    composerBg: "#202020",
    composerBorder: "#3a3a3a",
    placeholder: "#6e6e6e",
    chipBg: "#2a2a2a",
    link: "#4d9fff",
  },
  light: {
    bg: "#ffffff",
    header: "#ffffff",
    border: "#e8e8e8",
    text: "#1e1e1e",
    dim: "#6e6e6e",
    userBg: "#f4f4f4",
    userBorder: "#e8e8e8",
    codeBg: "#f0f0f0",
    codeText: "#a31515",
    accent: "#0a72ff",
    composerBg: "#f9f9f9",
    composerBorder: "#e2e2e2",
    placeholder: "#9a9a9a",
    chipBg: "#f0f0f0",
    link: "#0a72ff",
  },
};

export const CURSOR_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif';

export const cursorTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: { colors: CURSOR_COLORS.light as unknown as Record<string, string> },
  dark: { colors: CURSOR_COLORS.dark as unknown as Record<string, string> },
};
