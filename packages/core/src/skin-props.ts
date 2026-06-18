import type { ComposerMode, Participant } from "@typecaast/schema";
import type {
  ComposerState,
  RenderedMessage,
  RenderedReaction,
  ResolvedTheme,
  TypingState,
} from "./sim-state.js";

/**
 * Data props passed to skin components. These are intentionally **UI-agnostic**
 * (no React types) so `@typecaast/core` stays free of UI dependencies; the
 * `@typecaast/skin-kit` package wraps each one as a React `FC<…>`, adding
 * `children` where a component composes others (e.g. `Frame`).
 *
 * Every skin component receives the resolved `theme`.
 */

export interface FrameProps {
  theme: ResolvedTheme;
  /** Skin-specific options (validated by the skin's `optionsSchema`). */
  options?: Record<string, unknown>;
  /**
   * Resolved composer visibility, so chrome can mirror the reply box. iMessage
   * uses it to hide the on-screen keyboard when the composer is hidden
   * (`"never"`); skins that don't render input chrome can ignore it.
   */
  composer?: ComposerMode;
}

export interface MessageProps {
  theme: ResolvedTheme;
  message: RenderedMessage;
  /** The resolved author of this message. */
  author: Participant;
  /** The previous visible item's author, for grouping decisions. */
  previousAuthor?: Participant;
}

export interface SystemProps {
  theme: ResolvedTheme;
  /** A `variant: "system"` message; `message.system` carries card + actions. */
  message: RenderedMessage;
  author?: Participant;
}

export interface TypingProps {
  theme: ResolvedTheme;
  typing: TypingState;
  author: Participant;
}

export interface ReactionProps {
  theme: ResolvedTheme;
  reaction: RenderedReaction;
}

export interface ComposerProps {
  theme: ResolvedTheme;
  composer: ComposerState;
  /** The participant using the composer (usually self). */
  author?: Participant;
  /** Skin-specific options (validated by the skin's `optionsSchema`), mirroring
   *  `FrameProps.options` — e.g. the Cursor skin reads `options.model` to label
   *  the model chip in the reply box. */
  options?: Record<string, unknown>;
}

export interface AvatarProps {
  theme: ResolvedTheme;
  participant: Participant;
  /** Rendered size in px (skin default applies when omitted). */
  size?: number;
}
