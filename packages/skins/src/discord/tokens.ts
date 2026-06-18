import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

/** The Discord palette, per theme. */
export interface DiscordColors {
  bg: string;
  channelBar: string;
  channelBarBorder: string;
  sidebar: string;
  text: string;
  muted: string;
  username: string;
  timestamp: string;
  reactionBg: string;
  reactionBorder: string;
  reactionText: string;
  composerBg: string;
  placeholder: string;
  mentionText: string;
  mentionBg: string;
  codeBg: string;
  codeText: string;
  link: string;
  divider: string;
  hashtag: string;
}

export const DISCORD_COLORS: Record<ResolvedTheme, DiscordColors> = {
  dark: {
    bg: "#313338",
    channelBar: "#313338",
    channelBarBorder: "#26282c",
    sidebar: "#2b2d31",
    text: "#dbdee1",
    muted: "#949ba4",
    username: "#f2f3f5",
    timestamp: "#949ba4",
    reactionBg: "#2b2d31",
    reactionBorder: "#3f4147",
    reactionText: "#dbdee1",
    composerBg: "#383a40",
    placeholder: "#6d7079",
    mentionText: "#c9cdfb",
    mentionBg: "rgba(88,101,242,0.3)",
    codeBg: "#2b2d31",
    codeText: "#dbdee1",
    link: "#00a8fc",
    divider: "#3f4147",
    hashtag: "#80848e",
  },
  light: {
    bg: "#ffffff",
    channelBar: "#ffffff",
    channelBarBorder: "#e3e5e8",
    sidebar: "#f2f3f5",
    text: "#313338",
    muted: "#5c5e66",
    username: "#060607",
    timestamp: "#5c5e66",
    reactionBg: "#f2f3f5",
    reactionBorder: "#d6d9de",
    reactionText: "#4e5058",
    composerBg: "#ebedef",
    placeholder: "#87898c",
    mentionText: "#444ce0",
    mentionBg: "rgba(88,101,242,0.15)",
    codeBg: "#eef0f1",
    codeText: "#4f5660",
    link: "#006ce7",
    divider: "#e3e5e8",
    hashtag: "#6d6f78",
  },
};

export const discordTokens: { light: SkinTokens; dark: SkinTokens } = {
  light: { colors: DISCORD_COLORS.light as unknown as Record<string, string> },
  dark: { colors: DISCORD_COLORS.dark as unknown as Record<string, string> },
};

export const DISCORD_FONT_STACK =
  '"gg sans", "Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
