import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import {
  createEngine,
  type ResolvedTheme,
  type SimState,
} from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { cursor } from "./index.js";
import { CURSOR_COLORS } from "./tokens.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 400, height: 600 }, skin: { id: "cursor" } },
  participants: [
    { id: "me", name: "You", isSelf: true },
    { id: "ai", name: "Cursor", kind: "app" },
  ],
  timeline: [
    { type: "composerType", from: "me", text: "add a dark mode toggle" },
    { type: "send" },
    { type: "typing", from: "ai", showTypingFor: 1200 },
    {
      type: "message",
      from: "ai",
      text: "I'll add a `useTheme` hook and a toggle in the header.",
    },
    { type: "composerType", from: "me", text: "run the tests" },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function render(
  state: SimState,
  theme: ResolvedTheme,
  options: Record<string, unknown> = { title: "Chat" },
): string {
  const { Frame, Message, TypingIndicator, Composer } = cursor.components;
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={cursor.tokens?.[theme]}>
      <Frame theme={theme} options={options}>
        {state.messages.map((m) => (
          <Message
            key={m.id}
            theme={theme}
            message={m}
            author={byId.get(m.from)!}
          />
        ))}
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
            options={options}
          />
        ) : null}
      </Frame>
    </ThemeProvider>,
  );
}

describe("cursor panel skin", () => {
  it("supports dark+light, no reactions", () => {
    expect(cursor.meta.supportsThemes).toEqual(["dark", "light"]);
    expect(cursor.meta.capabilities.reactions).toBe(false);
  });

  it("renders the panel header, messages, model chip, and inline code", () => {
    const engine = createEngine(config, "dark", cursor.meta.capabilities);
    const html = render(engine.getStateAt(engine.durationMs), "dark");
    expect(html).toContain("Chat"); // header
    expect(html).toContain("dark mode toggle"); // user message
    expect(html).toContain("useTheme"); // inline code in assistant reply
    expect(html).toContain("Mythos"); // default model chip
    expect(html).toContain(CURSOR_COLORS.dark.bg); // dark panel bg
  });

  it("uses the `model` option for the model chip when provided", () => {
    const engine = createEngine(config, "dark", cursor.meta.capabilities);
    const html = render(engine.getStateAt(engine.durationMs), "dark", {
      title: "Chat",
      model: "GPT-9",
    });
    expect(html).toContain("GPT-9");
    expect(html).not.toContain("Mythos");
  });
});
