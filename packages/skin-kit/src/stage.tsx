import { useMemo, type ReactNode } from "react";
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
}: TypecaastStageProps): ReactNode {
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

  return (
    <ThemeProvider theme={theme} tokens={tokens}>
      <Frame theme={theme} options={options}>
        {/* Thread viewport: bottom-anchored + clipped, so as the thread grows
            older items shift up out of view ("content shifts up", PLAN §7).
            The engine's scroll.targetOffset is honored here once real layout
            measurement lands; for now the flex anchor gives the same feel. */}
        <div
          data-typecaast-thread=""
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {state.messages.map((message, i) => {
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
          })}
          {state.typingIndicators.map((typing, i) => {
            const author = byId.get(typing.from);
            if (!author) return null;
            return (
              <TypingIndicator
                key={`typing-${typing.from}-${i}`}
                theme={theme}
                typing={typing}
                author={author}
              />
            );
          })}
        </div>
        {showComposer ? (
          <Composer
            theme={theme}
            composer={state.composer}
            author={composerAuthor}
          />
        ) : null}
      </Frame>
    </ThemeProvider>
  );
}
