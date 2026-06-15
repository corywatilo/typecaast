import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

/** Telegram's palette per theme (matched to the Day/Night desktop themes). */
export interface TelegramColors {
  /** Chat wallpaper behind the bubbles. */
  bg: string;
  headerBg: string;
  headerText: string;
  /** Status / typing subtitle (accent-ish). */
  headerSubtle: string;
  subtle: string;
  link: string;
  mentionText: string;
  /** Sender name shown atop incoming group leads. */
  nameColor: string;
  incomingBg: string;
  incomingText: string;
  incomingMeta: string;
  outgoingBg: string;
  outgoingText: string;
  outgoingMeta: string;
  /** Read tick color on outgoing messages. */
  tick: string;
  reactionBg: string;
  reactionText: string;
  composerBg: string;
  composerFieldBg: string;
  composerBorder: string;
  placeholder: string;
  /** Accent fill for the send button + inline buttons. */
  accent: string;
  accentText: string;
  /** Inline-keyboard button (bot card actions). */
  buttonBg: string;
  buttonText: string;
  /** Centered service-message pill. */
  systemBg: string;
  systemText: string;
  shadow: string;
}

export const TELEGRAM_COLORS: Record<ResolvedTheme, TelegramColors> = {
  light: {
    bg: "#d5e3f0",
    headerBg: "#ffffff",
    headerText: "#000000",
    headerSubtle: "#3390ec",
    subtle: "#a1aab3",
    link: "#3390ec",
    mentionText: "#3390ec",
    nameColor: "#3390ec",
    incomingBg: "#ffffff",
    incomingText: "#000000",
    incomingMeta: "#a1aab3",
    outgoingBg: "#effdde",
    outgoingText: "#000000",
    outgoingMeta: "#5fb15a",
    tick: "#5fb15a",
    reactionBg: "#e8f3ff",
    reactionText: "#3390ec",
    composerBg: "#ffffff",
    composerFieldBg: "#ffffff",
    composerBorder: "#e3e8ec",
    placeholder: "#a1aab3",
    accent: "#3390ec",
    accentText: "#ffffff",
    buttonBg: "rgba(51,144,236,0.10)",
    buttonText: "#3390ec",
    systemBg: "rgba(0,0,0,0.26)",
    systemText: "#ffffff",
    shadow: "0 1px 0.5px rgba(0,0,0,0.13)",
  },
  dark: {
    bg: "#0e1621",
    headerBg: "#17212b",
    headerText: "#ffffff",
    headerSubtle: "#6cb7eb",
    subtle: "#6d7f8f",
    link: "#62bcf9",
    mentionText: "#62bcf9",
    nameColor: "#62bcf9",
    incomingBg: "#182533",
    incomingText: "#ffffff",
    incomingMeta: "#6d7f8f",
    outgoingBg: "#2b5278",
    outgoingText: "#ffffff",
    outgoingMeta: "#8badd6",
    tick: "#72d5fd",
    reactionBg: "#213040",
    reactionText: "#62bcf9",
    composerBg: "#17212b",
    composerFieldBg: "#17212b",
    composerBorder: "#101921",
    placeholder: "#6d7f8f",
    accent: "#3390ec",
    accentText: "#ffffff",
    buttonBg: "rgba(98,188,249,0.12)",
    buttonText: "#62bcf9",
    systemBg: "rgba(0,0,0,0.4)",
    systemText: "#ffffff",
    shadow: "0 1px 2px rgba(0,0,0,0.35)",
  },
};

/** Pack the color sets into the generic `SkinTokens` shape for the contract. */
export const telegramTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: {
    colors: TELEGRAM_COLORS.light as unknown as Record<string, string>,
  },
  dark: { colors: TELEGRAM_COLORS.dark as unknown as Record<string, string> },
};
