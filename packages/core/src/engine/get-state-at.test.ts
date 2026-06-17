import { describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import { compile } from "./compile.js";
import { createGetStateAt, sampleState } from "./get-state-at.js";

function build(timeline: ConfigInput["timeline"]) {
  return compile(
    configSchema.parse({
      version: 1,
      meta: { canvas: { width: 1, height: 1 }, skin: { id: "x" }, seed: 42 },
      participants: [
        { id: "a", name: "A", isSelf: true },
        { id: "b", name: "B" },
      ],
      timeline,
    }),
  );
}

describe("sampleState", () => {
  it("is referentially stable for the same t (determinism)", () => {
    const c = build([
      { type: "message", from: "a", text: "hi" },
      { type: "message", from: "b", text: "yo" },
    ]);
    expect(sampleState(c, 5000, "light")).toEqual(
      sampleState(c, 5000, "light"),
    );
  });

  it("starts empty and reveals messages over time", () => {
    const c = build([{ type: "message", from: "a", text: "hello" }]);
    expect(sampleState(c, 0, "light").messages).toHaveLength(0);
    const end = sampleState(c, c.durationMs, "light");
    expect(end.messages).toHaveLength(1);
    expect(end.messages[0]!.revealProgress).toBe(1);
    expect(end.messages[0]!.isSelf).toBe(true);
  });

  it("carries the resolved theme through", () => {
    const c = build([{ type: "message", from: "a", text: "x" }]);
    expect(sampleState(c, 0, "dark").theme).toBe("dark");
  });

  it("shows a reaction once it lands", () => {
    const c = build([
      { type: "message", from: "a", text: "hi", id: "m1" },
      { type: "reaction", target: "$prev", emoji: "🦔", delay: 500 },
    ]);
    const m1 = c.messages.find((m) => m.id === "m1")!;
    const before = sampleState(c, m1.appearMs + m1.revealMs + 100, "light");
    const after = sampleState(c, m1.appearMs + m1.revealMs + 600, "light");
    expect(before.messages[0]!.reactions).toHaveLength(0);
    expect(after.messages[0]!.reactions[0]!.emoji).toBe("🦔");
  });

  it("shows a typing indicator only inside its window", () => {
    const c = build([
      { type: "typing", from: "b", showTypingFor: 1000 },
      { type: "message", from: "b", text: "done" },
    ]);
    const ty = c.typings[0]!;
    expect(
      sampleState(c, ty.startMs - 1, "light").typingIndicators,
    ).toHaveLength(0);
    expect(
      sampleState(c, (ty.startMs + ty.endMs) / 2, "light").typingIndicators,
    ).toHaveLength(1);
    expect(sampleState(c, ty.endMs + 1, "light").typingIndicators).toHaveLength(
      0,
    );
  });

  it("types into the composer and clears it after send", () => {
    const c = build([
      { type: "composerType", from: "a", text: "Hello world" },
      { type: "send" },
    ]);
    const comp = c.composers[0]!;
    const mid = sampleState(c, (comp.startMs + comp.endMs) / 2, "light");
    expect(mid.composer.from).toBe("a");
    expect(mid.composer.text.length).toBeGreaterThan(0);
    expect(mid.composer.text.length).toBeLessThan("Hello world".length);
    // After send the composer is empty again.
    const after = sampleState(c, comp.sendMs! + 50, "light");
    expect(after.composer.text).toBe("");
  });

  it("groups consecutive same-author messages", () => {
    const c = build([
      { type: "message", from: "a", text: "one", instant: true },
      { type: "message", from: "a", text: "two", instant: true },
    ]);
    const s = sampleState(c, c.durationMs, "light");
    expect(s.messages[0]!.isGrouped).toBe(false);
    expect(s.messages[1]!.isGrouped).toBe(true);
  });

  it("removes a deleted message and applies an edit", () => {
    const c = build([
      { type: "message", from: "a", text: "original", id: "m1" },
      { type: "edit", target: "m1", text: "edited" },
    ]);
    const m1 = c.messages.find((m) => m.id === "m1")!;
    const s = sampleState(c, m1.editedAtMs! + 10, "light");
    expect(s.messages[0]!.state).toBe("edited");
  });

  it("createGetStateAt binds theme", () => {
    const c = build([{ type: "message", from: "a", text: "x" }]);
    const get = createGetStateAt(c, "dark");
    expect(get(0).theme).toBe("dark");
  });
});
