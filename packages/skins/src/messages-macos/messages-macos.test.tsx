import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import {
  createEngine,
  type ResolvedTheme,
  type SimState,
} from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { messagesMacos } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 900, height: 600 },
    skin: { id: "messages-macos", options: { contact: "Sam Carter" } },
  },
  participants: [
    { id: "me", name: "Me", isSelf: true },
    { id: "sam", name: "Sam Carter" },
  ],
  timeline: [
    { type: "message", from: "sam", text: "running late", id: "m1" },
    { type: "reaction", target: "m1", emoji: "👍", from: "me" },
    { type: "message", from: "me", text: "no worries" },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function render(state: SimState, theme: ResolvedTheme): string {
  const { Frame, Message } = messagesMacos.components;
  return renderToStaticMarkup(
    <ThemeProvider theme={theme} tokens={messagesMacos.tokens?.[theme]}>
      <Frame theme={theme} options={{ contact: "Sam Carter" }}>
        {state.messages.map((m) => (
          <Message
            key={m.id}
            theme={theme}
            message={m}
            author={byId.get(m.from)!}
          />
        ))}
      </Frame>
    </ThemeProvider>,
  );
}

describe("messages (macOS) skin", () => {
  it("shares iMessage capabilities + tokens, supports light+dark", () => {
    expect(messagesMacos.meta.supportsThemes).toEqual(["light", "dark"]);
    expect(messagesMacos.meta.capabilities.reactions).toBe(true);
    expect(messagesMacos.meta.fonts?.[0]?.family).toBe("Inter");
  });

  it("renders the window chrome, sidebar, contact header, and bubbles", () => {
    const engine = createEngine(
      config,
      "light",
      messagesMacos.meta.capabilities,
    );
    const html = render(engine.getStateAt(engine.durationMs), "light");
    expect(html).toContain("Search"); // sidebar search
    expect(html).toContain("Sam Carter"); // sidebar + header contact
    expect(html).toContain("running late"); // a bubble
    expect(html).toContain("👍"); // shared tapback
    expect(html).toContain("Mum"); // another sidebar conversation
  });
});
