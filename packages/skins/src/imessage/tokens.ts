import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

export interface IMessageColors {
  bg: string;
  text: string;
  subtle: string;
  selfBubble: string;
  selfText: string;
  otherBubble: string;
  otherText: string;
  navBg: string;
  navBorder: string;
  statusText: string;
  composerBg: string;
  composerBorder: string;
  placeholder: string;
  keyboardBg: string;
  keyBg: string;
  keyText: string;
  keyShadow: string;
  tapbackBg: string;
  link: string;
}

export const IMESSAGE_COLORS: Record<ResolvedTheme, IMessageColors> = {
  light: {
    bg: "#ffffff",
    text: "#000000",
    subtle: "#8e8e93",
    selfBubble: "#0b93f6",
    selfText: "#ffffff",
    otherBubble: "#e9e9eb",
    otherText: "#000000",
    navBg: "rgba(249,249,249,0.94)",
    navBorder: "rgba(0,0,0,0.12)",
    statusText: "#000000",
    composerBg: "#ffffff",
    composerBorder: "#d1d1d6",
    placeholder: "#8e8e93",
    keyboardBg: "#d1d4db",
    keyBg: "#ffffff",
    keyText: "#000000",
    keyShadow: "rgba(0,0,0,0.28)",
    tapbackBg: "#e9e9eb",
    link: "#0b93f6",
  },
  dark: {
    bg: "#000000",
    text: "#ffffff",
    subtle: "#8e8e93",
    selfBubble: "#0b93f6",
    selfText: "#ffffff",
    otherBubble: "#26252a",
    otherText: "#ffffff",
    navBg: "rgba(22,22,22,0.92)",
    navBorder: "rgba(255,255,255,0.12)",
    statusText: "#ffffff",
    composerBg: "#1c1c1e",
    composerBorder: "#38383a",
    placeholder: "#8e8e93",
    keyboardBg: "#1c1c1e",
    keyBg: "#6b6b6f",
    keyText: "#ffffff",
    keyShadow: "rgba(0,0,0,0.5)",
    tapbackBg: "#26252a",
    link: "#0b93f6",
  },
};

export const IMESSAGE_FONT_STACK =
  'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif';

export const imessageTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: {
    colors: IMESSAGE_COLORS.light as unknown as Record<string, string>,
  },
  dark: { colors: IMESSAGE_COLORS.dark as unknown as Record<string, string> },
};
