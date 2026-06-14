import { describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import { compile } from "./compile.js";
import { resolveCapabilities, type Capabilities } from "./capabilities.js";

function build(timeline: ConfigInput["timeline"]) {
  return compile(
    configSchema.parse({
      version: 1,
      meta: { canvas: { width: 1, height: 1 }, skin: { id: "x" }, seed: 42 },
      participants: [{ id: "a", name: "A", isSelf: true }],
      timeline,
    }),
  );
}

const base: Capabilities = {
  events: {},
  content: {},
  reactions: true,
  threads: true,
  readReceipts: true,
};

describe("resolveCapabilities", () => {
  it("drops typing when the skin marks it unsupported", () => {
    const c = build([
      { type: "typing", from: "a", showTypingFor: 1000 },
      { type: "message", from: "a", text: "hi" },
    ]);
    const resolved = resolveCapabilities(c, {
      ...base,
      events: { typing: "unsupported" },
    });
    expect(resolved.typings).toHaveLength(0);
    expect(c.typings).toHaveLength(1); // original untouched
  });

  it("drops reactions when reactions: false", () => {
    const c = build([
      { type: "message", from: "a", text: "hi", id: "m1" },
      { type: "reaction", target: "$prev", emoji: "🦔" },
    ]);
    const resolved = resolveCapabilities(c, { ...base, reactions: false });
    expect(resolved.messages[0]!.reactions).toHaveLength(0);
    expect(c.messages[0]!.reactions).toHaveLength(1); // original untouched
  });

  it("filters out content node types the skin can't render", () => {
    const c = build([
      {
        type: "message",
        from: "a",
        text: "look:",
        images: [{ src: "x.png" }],
      },
    ]);
    const resolved = resolveCapabilities(c, {
      ...base,
      content: { image: false },
    });
    const types = resolved.messages[0]!.content.map((n) => n.type);
    expect(types).not.toContain("image");
    expect(types).toContain("text");
  });

  it("drops system cards when unsupported", () => {
    const c = build([
      { type: "message", from: "a", text: "hi" },
      { type: "system", from: "a", text: "PR opened", card: "pr-opened" },
    ]);
    const resolved = resolveCapabilities(c, {
      ...base,
      events: { system: "unsupported" },
    });
    expect(resolved.messages.every((m) => m.variant !== "system")).toBe(true);
    expect(resolved.messages).toHaveLength(1);
  });

  it("keeps everything when capabilities allow it", () => {
    const c = build([
      { type: "message", from: "a", text: "hi", id: "m1" },
      { type: "reaction", target: "$prev", emoji: "👍" },
    ]);
    const resolved = resolveCapabilities(c, base);
    expect(resolved.messages[0]!.reactions).toHaveLength(1);
  });
});
