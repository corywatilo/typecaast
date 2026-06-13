import { describe, expect, it } from "vitest";
import { metaSchema } from "./meta.js";
import { participantSchema, participantsSchema } from "./participants.js";
import { pacingSchema } from "./pacing.js";

describe("metaSchema", () => {
  it("applies defaults but requires canvas + skin", () => {
    const meta = metaSchema.parse({
      canvas: { width: 880, height: 720 },
      skin: { id: "slack" },
    });
    expect(meta.fps).toBe(30);
    expect(meta.fit).toBe("reflow");
    expect(meta.theme).toBe("auto");
    expect(meta.seed).toBe(42);
    expect(meta.background).toBe("transparent");
    expect(meta.assets).toBe("inline");
  });

  it("rejects a missing canvas", () => {
    expect(() => metaSchema.parse({ skin: { id: "slack" } })).toThrow();
  });

  it("rejects a non-positive canvas dimension", () => {
    expect(() =>
      metaSchema.parse({
        canvas: { width: 0, height: 720 },
        skin: { id: "x" },
      }),
    ).toThrow();
  });

  it("rejects an unknown fit mode", () => {
    expect(() =>
      metaSchema.parse({
        canvas: { width: 1, height: 1 },
        skin: { id: "x" },
        fit: "stretch",
      }),
    ).toThrow();
  });
});

describe("participantSchema", () => {
  it("defaults kind to person", () => {
    const p = participantSchema.parse({ id: "cory", name: "Cory" });
    expect(p.kind).toBe("person");
    expect(p.isSelf).toBeUndefined();
  });

  it("accepts an app participant with self flag", () => {
    const p = participantSchema.parse({
      id: "bot",
      name: "PostHog",
      kind: "app",
    });
    expect(p.kind).toBe("app");
  });

  it("validates an array of participants", () => {
    const list = participantsSchema.parse([
      { id: "a", name: "A", isSelf: true },
      { id: "b", name: "B", color: "#5b3a8e" },
    ]);
    expect(list).toHaveLength(2);
  });
});

describe("pacingSchema", () => {
  it("fills every default from an empty object", () => {
    const pacing = pacingSchema.parse({});
    expect(pacing).toEqual({
      readingWpm: 240,
      typingCps: 14,
      reactionDelayMs: 700,
      interMessageGapMs: 900,
      humanize: 0.15,
      startDelayMs: 400,
    });
  });

  it("clamps humanize to the 0–1 range", () => {
    expect(() => pacingSchema.parse({ humanize: 1.5 })).toThrow();
  });
});
