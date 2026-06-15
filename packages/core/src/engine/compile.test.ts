import { describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import { compile } from "./compile.js";

function cfg(
  timeline: ConfigInput["timeline"],
  pacing?: ConfigInput["pacing"],
) {
  return configSchema.parse({
    version: 1,
    meta: { canvas: { width: 1, height: 1 }, skin: { id: "x" }, seed: 42 },
    participants: [
      { id: "a", name: "A", isSelf: true },
      { id: "b", name: "B" },
    ],
    pacing,
    timeline,
  });
}

describe("compile", () => {
  it("places messages in order, each after the start delay", () => {
    const t = compile(
      cfg([
        { type: "message", from: "a", text: "first" },
        { type: "message", from: "b", text: "second" },
      ]),
    );
    expect(t.messages).toHaveLength(2);
    expect(t.messages[0]!.appearMs).toBeGreaterThan(0);
    expect(t.messages[1]!.appearMs).toBeGreaterThan(t.messages[0]!.appearMs);
    expect(t.durationMs).toBeGreaterThan(t.messages[1]!.appearMs);
  });

  it("honors an explicit delay override", () => {
    const t = compile(
      cfg([
        { type: "message", from: "a", text: "hi" },
        { type: "message", from: "b", text: "later", delay: 5000 },
      ]),
    );
    const gap = t.messages[1]!.appearMs - t.messages[0]!.appearMs;
    expect(gap).toBeGreaterThanOrEqual(5000);
  });

  it("reveals instantly with instant: true", () => {
    const t = compile(
      cfg([{ type: "message", from: "a", text: "x", instant: true }]),
    );
    expect(t.messages[0]!.revealMs).toBe(0);
  });

  it("lands a reaction on its target after the target appears", () => {
    const t = compile(
      cfg([
        { type: "message", from: "a", text: "hi", id: "m1" },
        { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
      ]),
    );
    const m1 = t.messages.find((m) => m.id === "m1")!;
    expect(m1.reactions).toHaveLength(1);
    expect(m1.reactions[0]!.emoji).toBe("🦔");
    expect(m1.reactions[0]!.appearMs).toBeGreaterThanOrEqual(
      m1.appearMs + m1.revealMs + 1200,
    );
  });

  it("opens a typing window before a message with typing", () => {
    const t = compile(
      cfg([
        {
          type: "message",
          from: "b",
          text: "thinking",
          typing: { showTypingFor: 1500 },
        },
      ]),
    );
    expect(t.typings).toHaveLength(1);
    const typing = t.typings[0]!;
    const msg = t.messages[0]!;
    expect(typing.from).toBe("b");
    expect(typing.endMs).toBeCloseTo(msg.appearMs, 0);
    expect(typing.endMs - typing.startMs).toBe(1500);
  });

  it("commits a composer's text to a message on send", () => {
    const t = compile(
      cfg([
        { type: "composerType", from: "a", text: "Hello there" },
        { type: "send" },
      ]),
    );
    expect(t.composers).toHaveLength(1);
    expect(t.composers[0]!.sendMs).toBeDefined();
    // The send produced a message carrying the composed text.
    expect(t.messages).toHaveLength(1);
    expect(t.messages[0]!.from).toBe("a");
  });

  it("the sent message inherits the composer's sender, ignoring a stray send.from", () => {
    const t = compile(
      cfg([
        { type: "composerType", from: "b", text: "from b" },
        // A stray `from` on the send (e.g. a self-default) must not win.
        { type: "send", from: "a" },
      ]),
    );
    expect(t.messages).toHaveLength(1);
    expect(t.messages[0]!.from).toBe("b");
  });

  it("advances the cursor by a beat's duration", () => {
    const withBeat = compile(
      cfg([
        { type: "message", from: "a", text: "x", instant: true, delay: 0 },
        { type: "beat", duration: 3000 },
        { type: "message", from: "b", text: "y", delay: 0, instant: true },
      ]),
    );
    const gap = withBeat.messages[1]!.appearMs - withBeat.messages[0]!.appearMs;
    expect(gap).toBeGreaterThanOrEqual(3000);
  });

  it("is deterministic across separate parses of the same config", () => {
    const timeline: ConfigInput["timeline"] = [
      { type: "message", from: "a", text: "hello world" },
      { type: "typing", from: "b" },
      { type: "message", from: "b", text: "hi back" },
      { type: "reaction", target: "$prev", emoji: "👍" },
    ];
    expect(compile(cfg(timeline))).toEqual(compile(cfg(timeline)));
  });
});
