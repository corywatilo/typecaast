import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import {
  createEngine,
  type ResolvedTheme,
  type SimState,
} from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { imessage } from "./index.js";
import { IMESSAGE_COLORS } from "./tokens.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 390, height: 844 },
    skin: { id: "imessage", options: { contact: "Sam" } },
  },
  participants: [
    { id: "me", name: "Me", isSelf: true },
    { id: "sam", name: "Sam" },
  ],
  timeline: [
    { type: "message", from: "sam", text: "running late, 5 min", id: "m1" },
    { type: "reaction", target: "m1", emoji: "👍", from: "me" },
    { type: "message", from: "me", text: "no worries!" },
    { type: "typing", from: "sam", showTypingFor: 1200 },
    { type: "message", from: "sam", text: "omw" },
    { type: "composerType", from: "me", text: "see you soon" },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function render(state: SimState, theme: ResolvedTheme): string {
  const { Frame, Message, TypingIndicator, Composer } = imessage.components;
  const composerAuthor = state.composer.from
    ? byId.get(state.composer.from)
    : undefined;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={imessage.tokens?.[theme]}>
      <Frame theme={theme} options={{ contact: "Sam" }}>
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
          />
        ) : null}
      </Frame>
    </ThemeProvider>,
  );
}

describe("imessage (iOS) skin", () => {
  it("supports light+dark, declares Inter (SF Pro substitute), tapbacks + receipts", () => {
    expect(imessage.meta.supportsThemes).toEqual(["light", "dark"]);
    expect(imessage.meta.fonts?.[0]?.family).toBe("Inter");
    expect(imessage.meta.fonts?.[0]?.intended).toBe("SF Pro");
    expect(imessage.meta.capabilities.reactions).toBe(true);
    expect(imessage.meta.capabilities.readReceipts).toBe(true);
  });

  it("renders the status bar, contact, bubbles, keyboard, and a tapback", () => {
    const engine = createEngine(config, "light", imessage.meta.capabilities);
    const html = render(engine.getStateAt(engine.durationMs), "light");
    expect(html).toContain("9:41"); // status bar time
    expect(html).toContain("Sam"); // contact in nav bar
    expect(html).toContain("running late"); // a message
    expect(html).toContain("👍"); // tapback reaction
    expect(html).toContain("see you soon"); // composer typed text
    expect(html).toContain("return"); // keyboard key
    expect(html).toContain(IMESSAGE_COLORS.light.selfBubble); // blue self bubble
  });

  it("uses the dark palette in dark mode", () => {
    const engine = createEngine(config, "dark", imessage.meta.capabilities);
    const html = render(engine.getStateAt(1000), "dark");
    expect(html).toContain(IMESSAGE_COLORS.dark.bg); // #000000 background
  });
});
