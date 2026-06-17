import type { ContentNode } from "@typecaast/schema";

/**
 * The resolved theme for a render. `auto` is resolved to a concrete mode before
 * it reaches `SimState` / skins.
 */
export type ResolvedTheme = "light" | "dark";

/** Lifecycle state of a rendered thread item. */
export type MessageState = "typing" | "sending" | "sent" | "edited" | "deleted";

/** Whether a thread item is a regular message or an app/system card. */
export type MessageVariant = "message" | "system";

/** A system/app card payload (e.g. "Pull request opened" + action buttons). */
export interface SystemCard {
  /** Named card variant the skin renders, e.g. `"pr-opened"`. */
  card?: string;
  actions?: {
    label: string;
    href?: string;
    variant?: "primary" | "secondary";
  }[];
}

/** A reaction currently shown on a message. */
export interface RenderedReaction {
  emoji: string;
  /** Emoji shortcode without colons (e.g. `"eyes"`), for skin tooltips. */
  shortcode?: string;
  count: number;
  /** Participant ids who reacted (for grouping/tooltips). */
  by: string[];
  /** Display names of the reactors, resolved from participants (for tooltips). */
  byNames: string[];
  /** 0..1 pop-in progress. */
  progress: number;
}

/** A message in the visible thread, with animation progress. */
export interface RenderedMessage {
  id: string;
  /** Author participant id. */
  from: string;
  variant: MessageVariant;
  /** Resolved body content nodes (sugar already compiled). */
  content: ContentNode[];
  /**
   * 0..1 reveal/typing progress: 0 = just appearing, 1 = fully shown. Skins
   * drive all motion from this value (never CSS transition timing), so the live
   * preview and the exported video animate identically.
   */
  revealProgress: number;
  state: MessageState;
  reactions: RenderedReaction[];
  /** From the self participant — rendered on the "self" side. */
  isSelf: boolean;
  /** Visually grouped with the previous item (same author, close in time). */
  isGrouped: boolean;
  /** Display time in ms from timeline start. */
  atMs: number;
  /** Present when `variant === "system"`. */
  system?: SystemCard;
}

/** A typing indicator currently shown. */
export interface TypingState {
  /** Participant id who is typing. */
  from: string;
  /** 0..1 progress through the indicator's shown duration. */
  progress: number;
}

/** The composer (input) state. */
export interface ComposerState {
  /** Participant id currently using the composer (usually the self participant). */
  from?: string;
  /** Text typed so far. */
  text: string;
  /** Caret index within `text`. */
  caret: number;
  /** A send is committing this frame. */
  sending: boolean;
}

export type ScrollReason = "new-message" | "reaction" | "none";

export interface ScrollState {
  /** Target scroll offset the renderer animates toward as the thread grows. */
  targetOffset: number;
  reason: ScrollReason;
}

/**
 * The complete renderable state of the conversation at an instant — the return
 * type of the engine's pure `getStateAt(t)` and the single contract every
 * renderer (React, Remotion) and skin consumes.
 */
export interface SimState {
  /** Visible thread items with reveal/typing progress. */
  messages: RenderedMessage[];
  /** Typing indicators currently shown. */
  typingIndicators: TypingState[];
  composer: ComposerState;
  scroll: ScrollState;
  /** Total timeline length in ms (drives video duration). */
  durationMs: number;
  /** Resolved theme (`auto` already resolved to light/dark). */
  theme: ResolvedTheme;
}
