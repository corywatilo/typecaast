import type { FC, ReactNode } from "react";
import type { ZodType } from "zod";
import type { Size, StepType } from "@typecaast/schema";
import type {
  AvatarProps,
  ComposerProps,
  FrameProps,
  MessageProps,
  ReactionProps,
  ResolvedTheme,
  SystemProps,
  TypingProps,
} from "@typecaast/core";

/**
 * How a skin represents a given event type:
 * - `native`: a first-class affordance (Slack "X is typing…").
 * - `fallback`: rendered in a degraded but present form.
 * - `unsupported`: dropped from this skin's render (kept in the config).
 */
export type EventCapability = "native" | "fallback" | "unsupported";

/**
 * What a skin supports and how it represents each event/content type. The
 * engine reads this to drop unsupported events/content per-skin (retaining
 * them in the config); the builder surfaces drops as non-blocking warnings.
 */
export interface Capabilities {
  events: Partial<Record<StepType, EventCapability>>;
  /** Keyed by content node type (e.g. `image: true`, `videoEmbed: false`). */
  content: Partial<Record<string, boolean>>;
  reactions: boolean;
  threads: boolean;
  readReceipts: boolean;
}

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
