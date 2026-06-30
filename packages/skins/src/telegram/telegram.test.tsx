import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  buildMockBillingToastState,
  mockParticipants,
  MOCK_BILLING_TOAST_DURATION_MS,
} from "@typecaast/core/mocks";
import type { Participant } from "@typecaast/schema";
import type { ResolvedTheme, SimState } from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { telegram } from "./index.js";

const byId = new Map<string, Participant>(
  mockParticipants.map((p) => [p.id, p]),
);

/** Render the whole skin from a SimState the way the stage would. */
function renderSkin(state: SimState, theme: ResolvedTheme): string {
  const { Frame, Message, SystemMessage, TypingIndicator, Composer } =
    telegram.components;
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={telegram.tokens?.[theme]}>
      <Frame theme={theme} options={{ title: "Alerts", status: "online" }}>
        {state.messages.map((m) => {
          const author = byId.get(m.from)!;
          return m.variant === "system" ? (
            <SystemMessage
              key={m.id}
              theme={theme}
              message={m}
              author={author}
            />
          ) : (
            <Message key={m.id} theme={theme} message={m} author={author} />
          );
        })}
        {state.typingIndicators.map((t, i) => (
          <TypingIndicator
            key={i}
            theme={theme}
            typing={t}
            author={byId.get(t.from)!}
          />
        ))}
        {composerAuthor ? (
          <Composer
            theme={theme}
            composer={state.composer}
            author={composerAuthor}
          />
        ) : null}
      </Frame>
    </ThemeProvider>,
  );
}

describe("telegram skin", () => {
  it("declares Telegram metadata, capabilities, fonts, and both themes", () => {
    expect(telegram.id).toBe("telegram");
    expect(telegram.meta.supportsThemes).toEqual(["light", "dark"]);
    expect(telegram.meta.capabilities.events.typing).toBe("native");
    expect(telegram.meta.fonts?.[0]?.family).toBe("Roboto");
    expect(telegram.tokens?.light).toBeDefined();
    expect(telegram.tokens?.dark).toBeDefined();
  });

  it("renders the chat header title, status, and message text", () => {
    const html = renderSkin(buildMockBillingToastState(900), "light");
    expect(html).toContain("Alerts");
    expect(html).toContain("online");
    expect(html).toContain("billing toast error");
    expect(html).toContain("Roboto"); // font stack applied
  });

  it("renders a system notice as a centered pill", () => {
    const state: SimState = {
      messages: [
        {
          id: "sys",
          from: "posthog-bot",
          variant: "system",
          content: [
            {
              type: "text",
              spans: [{ type: "text", value: "Cory joined the group" }],
            },
          ],
          revealProgress: 1,
          state: "sent",
          reactions: [],
          isSelf: false,
          isGrouped: false,
          atMs: 0,
        },
      ],
      typingIndicators: [],
      composer: { from: undefined, text: "", caret: 0, sending: false },
      scroll: { targetOffset: 0, reason: "none" },
      durationMs: 1000,
      theme: "light",
    };
    const html = renderSkin(state, "light");
    expect(html).toContain("Cory joined the group");
    expect(html).toContain("justify-content:center"); // centered pill
  });

  it("renders the reaction pill", () => {
    const html = renderSkin(buildMockBillingToastState(2300), "light");
    expect(html).toContain("🦔");
  });

  it("renders the composer text while typing", () => {
    const html = renderSkin(buildMockBillingToastState(9800), "light");
    expect(html).toContain("Let me check");
  });

  it("renders in dark theme with the dark wallpaper", () => {
    const html = renderSkin(
      buildMockBillingToastState(MOCK_BILLING_TOAST_DURATION_MS),
      "dark",
    );
    expect(html).toContain("#0e1621");
  });
});
