import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

export interface WhatsAppColors {
  wallpaper: string;
  header: string;
  headerText: string;
  headerSubtle: string;
  text: string;
  subtle: string;
  selfBubble: string;
  selfText: string;
  otherBubble: string;
  otherText: string;
  bubbleTime: string;
  tick: string;
  composerBar: string;
  inputBg: string;
  placeholder: string;
  accent: string;
  reactionBg: string;
}

export const WHATSAPP_COLORS: Record<ResolvedTheme, WhatsAppColors> = {
  light: {
    wallpaper: "#efeae2",
    header: "#008069",
    headerText: "#ffffff",
    headerSubtle: "rgba(255,255,255,0.8)",
    text: "#111b21",
    subtle: "#667781",
    selfBubble: "#d9fdd3",
    selfText: "#111b21",
    otherBubble: "#ffffff",
    otherText: "#111b21",
    bubbleTime: "#667781",
    tick: "#53bdeb",
    composerBar: "#f0f2f5",
    inputBg: "#ffffff",
    placeholder: "#8696a0",
    accent: "#00a884",
    reactionBg: "#ffffff",
  },
  dark: {
    wallpaper: "#0b141a",
    header: "#202c33",
    headerText: "#e9edef",
    headerSubtle: "#8696a0",
    text: "#e9edef",
    subtle: "#8696a0",
    selfBubble: "#005c4b",
    selfText: "#e9edef",
    otherBubble: "#202c33",
    otherText: "#e9edef",
    bubbleTime: "#8696a0",
    tick: "#53bdeb",
    composerBar: "#202c33",
    inputBg: "#2a3942",
    placeholder: "#8696a0",
    accent: "#00a884",
    reactionBg: "#2a3942",
  },
};

export const WHATSAPP_FONT_STACK =
  '"Helvetica Neue", Helvetica, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

export const whatsappTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: {
    colors: WHATSAPP_COLORS.light as unknown as Record<string, string>,
  },
  dark: { colors: WHATSAPP_COLORS.dark as unknown as Record<string, string> },
};
