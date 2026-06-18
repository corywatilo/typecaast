import type { FC, ReactNode } from "react";
import type { ZodType } from "zod";
import type { Size } from "@typecaast/schema";
import type {
  AvatarProps,
  Capabilities,
  ComposerProps,
  FrameProps,
  MessageProps,
  ReactionProps,
  ResolvedTheme,
  SystemProps,
  TypingProps,
} from "@typecaast/core";

// The Capabilities contract is owned by the engine (`@typecaast/core`) so it can
// resolve unsupported events/content; re-exported here for skin authors.
export type { Capabilities, EventCapability } from "@typecaast/core";

/** Per-theme design tokens. Open-ended so skins add their own scales. */
export interface SkinTokens {
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  space?: Record<string, string | number>;
  radius?: Record<string, string | number>;
  [key: string]: unknown;
}

/** A web-font source for the `@font-face` / `FontFace` loader. */
export interface FontSource {
  url: string;
  weight?: number | string;
  style?: "normal" | "italic";
  format?: string;
}

/**
 * A declared font for a skin (PLAN §19). The renderer loads the declared font
 * (never relies on a host OS font); `intended` records the real font being
 * substituted (e.g. SF Pro → Inter) so the choice is transparent.
 */
export interface FontDeclaration {
  /** CSS family name the skin's tokens reference. */
  family: string;
  /** The real font this substitutes for, if any (documentation/transparency). */
  intended?: string;
  weights?: number[];
  sources: FontSource[];
}

/** Skin metadata. */
export interface SkinMeta {
  name: string;
  defaultCanvas: Size;
  /** Themes the skin ships (e.g. `["light","dark"]` or `["dark"]` for a TUI). */
  supportsThemes: ResolvedTheme[];
  capabilities: Capabilities;
  /** Validates `meta.skin.options` for this skin. */
  optionsSchema?: ZodType;
  /** Fonts the skin declares and loads (live + export). */
  fonts?: FontDeclaration[];
  /**
   * Where "X is typing…" renders. `"thread"` (default) shows it inline in the
   * message flow (a bubble, like iMessage); `"below-composer"` shows it under
   * the reply box (like Slack). Self-authored typing never renders either way.
   */
  typingPlacement?: "thread" | "below-composer";
}

/** The presentational React components a skin provides. */
export interface SkinComponents {
  /** Chrome: header, channel name, thread title; wraps the message list. */
  Frame: FC<FrameProps & { children?: ReactNode }>;
  Message: FC<MessageProps>;
  TypingIndicator: FC<TypingProps>;
  Reaction: FC<ReactionProps>;
  Composer: FC<ComposerProps>;
  SystemMessage: FC<SystemProps>;
  Avatar: FC<AvatarProps>;
}

/**
 * A skin: typed presentational components + metadata. Must be **pure and
 * SSR-safe** (no `window`-only access at module top level) so the same code
 * renders in the browser and in Remotion's Node renderer.
 */
export interface Skin {
  id: string;
  meta: SkinMeta;
  components: SkinComponents;
  tokens?: { light: SkinTokens; dark: SkinTokens };
}
