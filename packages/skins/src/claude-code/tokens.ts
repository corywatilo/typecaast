import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

/** The Claude Code TUI palette, per theme. */
export interface TuiColors {
  bg: string;
  titleBar: string;
  border: string;
  text: string;
  dim: string;
  prompt: string;
  accent: string;
  spinner: string;
  system: string;
  cursor: string;
  dotRed: string;
  dotYellow: string;
  dotGreen: string;
}

export const TUI_COLORS: Record<ResolvedTheme, TuiColors> = {
  dark: {
    bg: "#1a1a1a",
    titleBar: "#2a2a2a",
    border: "#3a3a3a",
    text: "#e6e6e6",
    dim: "#8b8b8b",
    prompt: "#d97757", // Claude coral
    accent: "#d97757",
    spinner: "#d97757",
    system: "#7aa2f7", // tool/blue
    cursor: "#d97757",
    dotRed: "#ff5f56",
    dotYellow: "#ffbd2e",
    dotGreen: "#27c93f",
  },
  light: {
    bg: "#ffffff",
    titleBar: "#e8e8e8",
    border: "#e0e0e0",
    text: "#2b2b2b",
    dim: "#6e6e6e",
    prompt: "#c2552f", // coral, deepened for contrast on white
    accent: "#c2552f",
    spinner: "#c2552f",
    system: "#1f6feb", // tool/blue, darker for light bg
    cursor: "#c2552f",
    dotRed: "#ff5f56",
    dotYellow: "#ffbd2e",
    dotGreen: "#27c93f",
  },
};

export const tuiTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: { colors: TUI_COLORS.light as unknown as Record<string, string> },
  dark: { colors: TUI_COLORS.dark as unknown as Record<string, string> },
};

export const MONO_STACK =
  '"JetBrains Mono", "SF Mono", Menlo, Monaco, "Cascadia Code", "Roboto Mono", monospace';
