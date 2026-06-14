import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

/** The Slack-style palette per theme (matched to the real app's spacing/color). */
export interface SlackColors {
  bg: string;
  text: string;
  subtle: string;
  border: string;
  headerBg: string;
  link: string;
  mentionText: string;
  mentionBg: string;
  codeText: string;
  codeBg: string;
  codeBorder: string;
  reactionBg: string;
  reactionBorder: string;
  reactionText: string;
  composerBg: string;
  composerBorder: string;
  placeholder: string;
  primary: string;
  primaryText: string;
  buttonBorder: string;
  buttonText: string;
  appBadgeBg: string;
  appBadgeText: string;
  cardBar: string;
  caret: string;
}

export const SLACK_COLORS: Record<ResolvedTheme, SlackColors> = {
  light: {
    bg: "#ffffff",
    text: "#1d1c1d",
    subtle: "#616061",
    border: "#e2e2e2",
    headerBg: "#ffffff",
    link: "#1264a3",
    mentionText: "#1264a3",
    mentionBg: "#e8f5fa",
    codeText: "#e01e5a",
    codeBg: "#f6f6f6",
    codeBorder: "#e2e2e2",
    reactionBg: "#f8f8f8",
    reactionBorder: "#e2e2e2",
    reactionText: "#454245",
    composerBg: "#ffffff",
    composerBorder: "#8d8d8d",
    placeholder: "#8d8d8d",
    primary: "#007a5a",
    primaryText: "#ffffff",
    buttonBorder: "#d1d1d1",
    buttonText: "#1d1c1d",
    appBadgeBg: "#e8e8e8",
    appBadgeText: "#616061",
    cardBar: "#dddddd",
    caret: "#1264a3",
  },
  dark: {
    bg: "#1a1d21",
    text: "#d1d2d3",
    subtle: "#ababad",
    border: "#35373b",
    headerBg: "#1a1d21",
    link: "#1d9bd1",
    mentionText: "#1d9bd1",
    mentionBg: "rgba(29,155,209,0.12)",
    codeText: "#e06c9a",
    codeBg: "#222529",
    codeBorder: "#35373b",
    reactionBg: "#222529",
    reactionBorder: "#35373b",
    reactionText: "#d1d2d3",
    composerBg: "#222529",
    composerBorder: "#565856",
    placeholder: "#9a9b9d",
    primary: "#007a5a",
    primaryText: "#ffffff",
    buttonBorder: "#565856",
    buttonText: "#d1d2d3",
    appBadgeBg: "#35373b",
    appBadgeText: "#ababad",
    cardBar: "#35373b",
    caret: "#1d9bd1",
  },
};

/** Pack the color sets into the generic `SkinTokens` shape for the contract. */
export const slackTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: { colors: SLACK_COLORS.light as unknown as Record<string, string> },
  dark: { colors: SLACK_COLORS.dark as unknown as Record<string, string> },
};
