import { useMemo, type ReactElement } from "react";
import type { ComposerMode, Participant } from "@typecaast/schema";
import type { SimState } from "@typecaast/core";
import { ThemeProvider } from "./theme.js";
import type { Skin } from "./types.js";

export type { ComposerMode };

export interface TypecaastStageProps {
  state: SimState;
  skin: Skin;
  participants: Participant[];
  /** Skin-specific options from `meta.skin.options`. */
  options?: Record<string, unknown>;
  /**
   * Composer visibility: `auto` (default) shows it only while someone is
   * typing/sending; `always` keeps the reply box visible (idle = placeholder);
   * `never` hides it.
   */
  composer?: ComposerMode;
}

/**
 * Maps a `SimState` onto a skin's components: a `Frame` wrapping the thread
 * items (Message / SystemMessage), the typing indicators, and the composer.
 * Reactions render inside the skin's `Message` (it reads `message.reactions`).
 *
 * Lives in `skin-kit` (the contract layer) so both `@typecaast/react` and the
 * skins' own stories can render a frame without depending on the React player.
 */
export function TypecaastStage({
  state,
  skin,
  participants,
  options,
  composer = "auto",
}: TypecaastStageProps): ReactElement {
  const theme = state.theme;
  const byId = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) map.set(p.id, p);
    return map;
  }, [participants]);

  const { Frame, Message, SystemMessage, TypingIndicator, Composer } =
    skin.components;
  const tokens = skin.tokens?.[theme];
  // `always` keeps the reply box mounted even when idle (falls back to the self
  // participant so a placeholder shows); `auto` only shows it while composing.
  const selfParticipant = useMemo(
    () => participants.find((p) => p.isSelf),
    [participants],
  );
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : composer === "always"
      ? selfParticipant
      : undefined;
  const showComposer = composer !== "never" && composerAuthor !== undefined;

  // "X is typing…" indicators, minus the viewer's own (you never see yourself
  // typing — that's what the composer shows). Placement is skin-driven: inline
  // in the thread by default, or below the composer (Slack).
  const typingPlacement = skin.meta.typingPlacement ?? "thread";
  const typingNodes = state.typingIndicators
    .map((typing, i) => {
      const author = byId.get(typing.from);
      if (!author || author.isSelf) return null;
      return (
        <TypingIndicator
          key={`typing-${typing.from}-${i}`}
          theme={theme}
          typing={typing}
          author={author}
        />
      );
    })
    .filter(Boolean);

  return (
    <ThemeProvider theme={theme} tokens={tokens}>
      <Frame theme={theme} options={options} composer={composer}>
        {/* Thread viewport. `column-reverse` pins the conversation to the
            bottom (newest message + composer sit at the bottom, older items
            "shift up", PLAN §7) and, once the thread outgrows the height, makes
            it scroll from the bottom with the top reachable — entirely in CSS,
            so it renders identically in a live embed, an SSR page, and a video
            frame (no scroll-to-bottom effect, which wouldn't run before a
            Remotion screenshot). Because `column-reverse` lays the first child
            out at the bottom, children render newest-first: the typing
            indicator (most recent activity) first, then messages reversed. The
            engine's scroll.targetOffset is honored here once real layout
            measurement lands. */}
        <div
          data-typecaast-thread=""
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            // Subtle scrollbar (Firefox); WebKit/Blink use the OS overlay
            // scrollbar, which already auto-hides on macOS/iOS.
            scrollbarWidth: "thin",
            // Breathing room beneath the last message — keeps it off the
            // composer (when shown) and the Frame's bottom edge (when hidden).
            paddingBottom: 16,
          }}
        >
          {typingPlacement === "thread" ? typingNodes : null}
          {state.messages
            .map((message, i) => {
              const author = byId.get(message.from);
              if (!author) return null;
              // Index-disambiguated so a config with duplicate message ids can't
              // collide React keys (the builder can produce them transiently).
              const key = `${message.id}-${i}`;
              if (message.variant === "system") {
                return (
                  <SystemMessage
                    key={key}
                    theme={theme}
                    message={message}
                    author={author}
                  />
                );
              }
              // Grouping looks at the chronological predecessor — computed
              // before the reverse below, so author-collapsing is unaffected.
              const prev = state.messages[i - 1];
              const previousAuthor = prev ? byId.get(prev.from) : undefined;
              return (
                <Message
                  key={key}
                  theme={theme}
                  message={message}
                  author={author}
                  previousAuthor={previousAuthor}
                />
              );
            })
            .reverse()}
        </div>
        {showComposer ? (
          <Composer
            theme={theme}
            composer={state.composer}
            author={composerAuthor}
          />
        ) : null}
        {typingPlacement === "below-composer" ? typingNodes : null}
      </Frame>
    </ThemeProvider>
  );
}
