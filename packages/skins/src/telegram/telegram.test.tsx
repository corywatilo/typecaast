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

  it("renders the bot card with author name, text, and inline buttons", () => {
    const html = renderSkin(buildMockBillingToastState(7800), "light");
    // Incoming bot bubbles label the sender (outgoing/self bubbles don't).
    expect(html).toContain("PostHog");
    expect(html).toContain("Pull request opened.");
    expect(html).toContain("View PR");
    expect(html).toContain("Open in PostHog Code");
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
