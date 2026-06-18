import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { createEngine } from "@typecaast/core";
import type { Participant } from "@typecaast/schema";
import type { SimState } from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { claudeCode } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 720, height: 480 }, skin: { id: "claude-code" } },
  participants: [
    { id: "user", name: "You", isSelf: true },
    { id: "claude", name: "Claude", kind: "app" },
  ],
  timeline: [
    { type: "composerType", from: "user", text: "fix the failing test" },
    { type: "send" },
    { type: "typing", from: "claude", showTypingFor: 1200 },
    { type: "message", from: "claude", text: "I'll look at the test now." },
    {
      type: "system",
      from: "claude",
      card: "tool",
      text: "Read src/foo.test.ts",
    },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function renderTui(state: SimState): string {
  const { Frame, Message, SystemMessage, TypingIndicator, Composer } =
    claudeCode.components;
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;
  return renderToStaticMarkup(
    <ThemeProvider theme="dark">
      <Frame theme="dark" options={{ title: "claude — zsh" }}>
        {state.messages.map((m) =>
          m.variant === "system" ? (
            <SystemMessage
              key={m.id}
              theme="dark"
              message={m}
              author={byId.get(m.from)!}
            />
          ) : (
            <Message
              key={m.id}
              theme="dark"
              message={m}
              author={byId.get(m.from)!}
            />
          ),
        )}
        {state.typingIndicators.map((t, i) => (
          <TypingIndicator
            key={i}
            theme="dark"
            typing={t}
            author={byId.get(t.from)!}
          />
        ))}
        {composerAuthor ? (
          <Composer
            theme="dark"
            composer={state.composer}
            author={composerAuthor}
          />
        ) : null}
      </Frame>
    </ThemeProvider>,
  );
}

describe("claude-code (TUI) skin", () => {
  it("supports both themes and declares a mono font + no reactions", () => {
    expect(claudeCode.id).toBe("claude-code");
    expect(claudeCode.meta.supportsThemes).toEqual(["dark", "light"]);
    expect(claudeCode.meta.capabilities.reactions).toBe(false);
    expect(claudeCode.meta.capabilities.content.image).toBe(false);
    expect(claudeCode.meta.fonts?.[0]?.family).toBe("JetBrains Mono");
  });

  it("renders a light palette when theme=light", () => {
    const { Frame } = claudeCode.components;
    const html = renderToStaticMarkup(
      <ThemeProvider theme="light">
        <Frame theme="light" options={{ title: "claude" }} />
      </ThemeProvider>,
    );
    expect(html).toContain("#ffffff"); // light background
    expect(html).toContain("#2b2b2b"); // dark text
  });

  it("renders the terminal chrome and streamed output", () => {
    const engine = createEngine(config, "dark", claudeCode.meta.capabilities);
    const html = renderTui(engine.getStateAt(engine.durationMs));
    expect(html).toContain("claude — zsh"); // title bar
    expect(html).toContain("❯"); // prompt
    expect(html).toContain("⏺"); // assistant marker
    expect(html).toContain("look at the test"); // assistant text
    expect(html).toContain("⎿"); // system/tool marker
    expect(html).toContain("Read src/foo.test.ts");
  });

  it("streams output text by revealProgress", () => {
    const { Message } = claudeCode.components;
    const full = "Reading the failing test file now.";
    const make = (progress: number) => ({
      id: "m",
      from: "claude",
      variant: "message" as const,
      content: [
        {
          type: "text" as const,
          spans: [{ type: "text" as const, value: full }],
        },
      ],
      revealProgress: progress,
      state: "sent" as const,
      reactions: [],
      isSelf: false,
      isGrouped: false,
      atMs: 0,
    });
    const author = byId.get("claude")!;
    const whole = renderToStaticMarkup(
      <Message theme="dark" message={make(1)} author={author} />,
    );
    const half = renderToStaticMarkup(
      <Message theme="dark" message={make(0.5)} author={author} />,
    );
    expect(whole).toContain(full);
    expect(half).not.toContain(full); // truncated mid-stream
  });
});
