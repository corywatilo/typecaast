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
import { slack } from "./index.js";

const byId = new Map<string, Participant>(
  mockParticipants.map((p) => [p.id, p]),
);

/** Render the whole skin from a SimState the way the stage would. */
function renderSkin(state: SimState, theme: ResolvedTheme): string {
  const { Frame, Message, SystemMessage, TypingIndicator, Composer } =
    slack.components;
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={slack.tokens?.[theme]}>
      <Frame theme={theme} options={{ channel: "#alerts" }}>
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

describe("slack skin", () => {
  it("declares Slack metadata, capabilities, fonts, and both themes", () => {
    expect(slack.id).toBe("slack");
    expect(slack.meta.supportsThemes).toEqual(["light", "dark"]);
    expect(slack.meta.capabilities.events.typing).toBe("native");
    expect(slack.meta.capabilities.events.readReceipt).toBe("unsupported");
    expect(slack.meta.fonts?.[0]?.family).toBe("Lato");
    expect(slack.tokens?.light).toBeDefined();
    expect(slack.tokens?.dark).toBeDefined();
  });

  it("renders the thread header, author, and message text", () => {
    const html = renderSkin(buildMockBillingToastState(900), "light");
    expect(html).toContain("Thread");
    expect(html).toContain("#alerts");
    expect(html).toContain("Cory Watilo");
    expect(html).toContain("billing toast error");
    expect(html).toContain("Lato"); // font stack applied
  });

  it("renders the PR system card with action buttons and APP badge", () => {
    const html = renderSkin(buildMockBillingToastState(7800), "light");
    expect(html).toContain("APP");
    expect(html).toContain("Pull request opened.");
    expect(html).toContain("View PR");
    expect(html).toContain("Open in PostHog Code");
  });

  it("renders the hedgehog reaction pill", () => {
    const html = renderSkin(buildMockBillingToastState(2300), "light");
    expect(html).toContain("🦔");
  });

  it("renders a typing indicator with the author name", () => {
    const html = renderSkin(buildMockBillingToastState(3000), "light");
    expect(html).toContain("Ambra is typing");
  });

  it("renders the composer text while typing", () => {
    const html = renderSkin(buildMockBillingToastState(9800), "light");
    expect(html).toContain("Let me check");
  });

  it("renders in dark theme with the dark background", () => {
    const html = renderSkin(
      buildMockBillingToastState(MOCK_BILLING_TOAST_DURATION_MS),
      "dark",
    );
    expect(html).toContain("#1a1d21");
  });
});
