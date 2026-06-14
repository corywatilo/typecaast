import { describe, expect, it } from "vitest";
import { createRng, withJitter } from "./rng.js";
import { graphemeCount, readingDelayMs, typingDurationMs } from "./pacing.js";

describe("createRng", () => {
  it("is deterministic for a seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = [a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("produces different streams for different seeds", () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });

  it("stays within [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("withJitter", () => {
  it("returns the value unchanged when fraction is 0 (no draw consumed)", () => {
    const rng = createRng(42);
    expect(withJitter(rng, 1000, 0)).toBe(1000);
    // The next draw matches a fresh stream — no draw was consumed.
    expect(rng()).toBe(createRng(42)());
  });

  it("stays within ±fraction of the value", () => {
    const rng = createRng(99);
    for (let i = 0; i < 200; i++) {
      const v = withJitter(rng, 1000, 0.15);
      expect(v).toBeGreaterThanOrEqual(850);
      expect(v).toBeLessThanOrEqual(1150);
    }
  });
});

describe("grapheme counting & durations", () => {
  it("counts plain text by character", () => {
    expect(graphemeCount("hello")).toBe(5);
  });

  it("counts an emoji ZWJ cluster as one grapheme", () => {
    // 👨‍👩‍👧 is one grapheme but several code points.
    expect(graphemeCount("👨‍👩‍👧")).toBe(1);
  });

  it("typing duration scales with cps", () => {
    expect(typingDurationMs("aaaaaaaaaaaaaa", 14)).toBeCloseTo(1000, 0); // 14 chars / 14 cps
  });

  it("reading delay scales with wpm", () => {
    // 60 graphemes ≈ 12 words; at 240 wpm ≈ 3s.
    expect(readingDelayMs("a".repeat(60), 240)).toBeCloseTo(3000, -2);
  });
});
