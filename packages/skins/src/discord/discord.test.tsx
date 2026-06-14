import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import { createEngine, type SimState } from "@typecaast/core";
import { ThemeProvider } from "@typecaast/skin-kit";
import { discord } from "./index.js";
import { DISCORD } from "./tokens.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 600, height: 480 },
    skin: { id: "discord", options: { channel: "dev" } },
  },
  participants: [
    { id: "me", name: "you", isSelf: true, color: "#5865f2" },
    { id: "ana", name: "ana", color: "#f47fff" },
  ],
  timeline: [
    {
      type: "message",
      from: "ana",
      text: "pushed the fix to `main`",
      id: "m1",
    },
    { type: "reaction", target: "m1", emoji: "🚀", from: "me" },
    { type: "message", from: "ana", text: "running CI now" }, // grouped
    { type: "message", from: "me", text: "nice, thanks @ana" },
  ],
});

const byId = new Map<string, Participant>(
  config.participants.map((p) => [p.id, p]),
);

function render(state: SimState): string {
  const { Frame, Message } = discord.components;
  return renderToStaticMarkup(
    <ThemeProvider theme="dark">
      <Frame theme="dark" options={{ channel: "dev" }}>
        {state.messages.map((m) => (
          <Message
            key={m.id}
            theme="dark"
            message={m}
            author={byId.get(m.from)!}
          />
        ))}
      </Frame>
    </ThemeProvider>,
  );
}

describe("discord skin", () => {
  it("is dark, with reactions + threads", () => {
    expect(discord.meta.supportsThemes).toEqual(["dark"]);
    expect(discord.meta.capabilities.reactions).toBe(true);
    expect(discord.meta.capabilities.threads).toBe(true);
  });

  it("renders the channel header, role-colored names, grouping, reactions", () => {
    const engine = createEngine(config, "dark", discord.meta.capabilities);
    const html = render(engine.getStateAt(engine.durationMs));
    expect(html).toContain("dev"); // channel name
    expect(html).toContain("pushed the fix"); // a message
    expect(html).toContain("#f47fff"); // ana's role color on her name
    expect(html).toContain("🚀"); // reaction
    expect(html).toContain(DISCORD.bg); // dark channel bg
    // The grouped "running CI now" has no second username header — only two
    // role-colored name spans appear (ana once, you once).
    const names = html.match(/color:#f47fff/g) ?? [];
    expect(names.length).toBe(1);
  });
});
