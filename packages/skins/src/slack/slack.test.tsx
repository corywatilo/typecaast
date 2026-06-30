import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  buildMockBillingToastState,
  mockParticipants,
  MOCK_BILLING_TOAST_DURATION_MS,
} from "@typecaast/core/mocks";
import type { Participant } from "@typecaast/schema";
import type { RenderedMessage, ResolvedTheme, SimState } from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { slack } from "./index.js";

/** Render a single message (app sender) through the Slack `Message` component. */
function renderMessage(
  content: RenderedMessage["content"],
  theme: ResolvedTheme = "light",
): string {
  const { Message } = slack.components;
  const author: Participant = { id: "ph", name: "PostHog", kind: "app" };
  const message: RenderedMessage = {
    id: "b1",
    from: "ph",
    variant: "message",
    content,
    revealProgress: 1,
    state: "sent",
    reactions: [],
    isSelf: false,
    isGrouped: false,
    atMs: 0,
  };
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={slack.tokens?.[theme]}>
      <Message theme={theme} message={message} author={author} />
    </ThemeProvider>,
  );
}

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

  it("renders the app PR card (message + blocks) with buttons and APP badge", () => {
    const html = renderSkin(buildMockBillingToastState(7800), "light");
    expect(html).toContain("APP"); // app sender badge
    expect(html).toContain("Pull request opened.");
    expect(html).toContain("View PR");
    expect(html).toContain("Open in PostHog Code");
    // Plain section + actions — no left-bar attachment around the app message.
    expect(html).not.toContain("border-left");
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

describe("slack skin — Block Kit blocks", () => {
  it("renders header, context, section (with marks + mention), divider, actions", () => {
    const html = renderMessage([
      { type: "header", text: "perf(inbox): Fix 26s admin inbox load" },
      {
        type: "context",
        elements: [
          {
            type: "text",
            spans: [
              { type: "text", value: "🟠 P2 · " },
              { type: "bold", value: "Session replay" },
            ],
          },
        ],
      },
      {
        type: "section",
        spans: [
          { type: "text", value: "Sales reps hit " },
          { type: "mention", id: "joe", label: "@Joe Saunderson" },
        ],
      },
      { type: "divider" },
      {
        type: "actions",
        elements: [
          { type: "button", label: "Review PR", style: "primary" },
          { type: "button", label: "Dismiss", style: "danger" },
          { type: "button", label: "Open in PostHog" },
        ],
      },
    ]);
    // App sender → APP badge; no left border (top-level blocks).
    expect(html).toContain("APP");
    expect(html).toContain("perf(inbox): Fix 26s admin inbox load");
    expect(html).toContain("<strong"); // bold mark
    expect(html).toContain("Session replay");
    expect(html).toContain("@Joe Saunderson"); // mention pill
    expect(html).toContain("Review PR");
    expect(html).toContain("Dismiss");
    expect(html).toContain("Open in PostHog");
    expect(html).toContain("#007a5a"); // primary green
    expect(html).toContain("#e01e5a"); // danger red (light theme)
  });

  it("renders an attachment as a colored left bar around nested blocks", () => {
    const html = renderMessage([
      {
        type: "attachment",
        color: "#36a64f",
        content: [
          {
            type: "section",
            spans: [{ type: "text", value: "Pull request opened." }],
          },
          {
            type: "actions",
            elements: [{ type: "button", label: "View PR", style: "primary" }],
          },
        ],
      },
    ]);
    expect(html).toContain("border-left:4px solid #36a64f");
    expect(html).toContain("Pull request opened.");
    expect(html).toContain("View PR");
  });

  it("renders a codeblock as a monospaced <pre> preserving literal text", () => {
    const code = "Metric    A    B\nCame back  64%  96%\n*not bold* ~no~";
    const html = renderMessage([{ type: "codeblock", text: code }]);
    expect(html).toContain("<pre"); // block element
    expect(html).toContain("white-space:pre"); // preserves whitespace/newlines
    expect(html).toContain("monospace"); // monospaced font stack
    // Text is literal — the `*` and `~` are NOT turned into marks.
    expect(html).toContain("*not bold* ~no~");
    expect(html).not.toContain("<strong>not bold</strong>");
  });
});
