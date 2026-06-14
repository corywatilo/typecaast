import { useMemo, type ReactNode } from "react";
import type { Participant } from "@typecaast/schema";
import type { SimState } from "@typecaast/core";
import { ThemeProvider, type Skin } from "@typecaast/skin-kit";

export interface TypecaastStageProps {
  state: SimState;
  skin: Skin;
  participants: Participant[];
  /** Skin-specific options from `meta.skin.options`. */
  options?: Record<string, unknown>;
}

/**
 * Maps a `SimState` onto a skin's components: a `Frame` wrapping the thread
 * items (Message / SystemMessage), the typing indicators, and the composer.
 * Reactions render inside the skin's `Message` (it reads `message.reactions`).
 */
export function TypecaastStage({
  state,
  skin,
  participants,
  options,
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
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;

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
            if (message.variant === "system") {
              return (
                <SystemMessage
                  key={message.id}
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
                key={message.id}
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
        {composerAuthor ? (
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
