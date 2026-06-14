/** The Claude Code TUI palette — dark only (terminals are single-mode). */
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

export const TUI_COLORS: TuiColors = {
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
};

export const MONO_STACK =
  '"JetBrains Mono", "SF Mono", Menlo, Monaco, "Cascadia Code", "Roboto Mono", monospace';
