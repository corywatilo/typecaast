import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import {
  createEngine,
  type ResolvedTheme,
  type SimState,
} from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { whatsapp } from "./index.js";
import { WHATSAPP_COLORS } from "./tokens.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 390, height: 760 },
    skin: { id: "whatsapp", options: { contact: "Mum", status: "online" } },
  },
  participants: [
    { id: "me", name: "Me", isSelf: true },
    { id: "mum", name: "Mum" },
  ],
  timeline: [
    { type: "message", from: "mum", text: "call me when you can ❤️", id: "m1" },
    { type: "reaction", target: "m1", emoji: "❤️", from: "me" },
    { type: "message", from: "me", text: "will do, just leaving now" },
    { type: "typing", from: "mum", showTypingFor: 1000 },
    { type: "message", from: "mum", text: "drive safe!" },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function render(state: SimState, theme: ResolvedTheme): string {
  const { Frame, Message, TypingIndicator } = whatsapp.components;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={whatsapp.tokens?.[theme]}>
      <Frame theme={theme} options={{ contact: "Mum", status: "online" }}>
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
      </Frame>
    </ThemeProvider>,
  );
}

describe("whatsapp skin", () => {
  it("supports light+dark, tapback reactions + receipts", () => {
    expect(whatsapp.meta.supportsThemes).toEqual(["light", "dark"]);
    expect(whatsapp.meta.capabilities.reactions).toBe(true);
    expect(whatsapp.meta.capabilities.readReceipts).toBe(true);
  });

  it("renders the header, bubbles, in-bubble time, double-tick, and a reaction", () => {
    const engine = createEngine(config, "light", whatsapp.meta.capabilities);
    const html = render(engine.getStateAt(engine.durationMs), "light");
    expect(html).toContain("Mum"); // header contact
    expect(html).toContain("online"); // header status
    expect(html).toContain("call me when you can"); // message
    expect(html).toContain("✓✓"); // double-tick on a self message
    expect(html).toContain("❤️"); // reaction
    expect(html).toContain(WHATSAPP_COLORS.light.selfBubble); // green self bubble
    expect(html).toMatch(/\d+:\d\d (AM|PM)/); // in-bubble timestamp
  });

  it("uses the dark wallpaper in dark mode", () => {
    const engine = createEngine(config, "dark", whatsapp.meta.capabilities);
    const html = render(engine.getStateAt(1000), "dark");
    expect(html).toContain(WHATSAPP_COLORS.dark.wallpaper);
  });
});
