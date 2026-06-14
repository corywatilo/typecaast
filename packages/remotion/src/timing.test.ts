import { describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { createEngine } from "@typecaast/core";
import { frameToMs, getDurationInFrames } from "./timing.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [
    { type: "message", from: "a", text: "hello" },
    { type: "message", from: "a", text: "world" },
  ],
});

describe("frameToMs", () => {
  it("maps frame index to ms at the given fps", () => {
    expect(frameToMs(0, 30)).toBe(0);
    expect(frameToMs(30, 30)).toBe(1000);
    expect(frameToMs(15, 30)).toBe(500);
    expect(frameToMs(60, 60)).toBe(1000);
  });
});

describe("getDurationInFrames", () => {
  it("covers the whole compiled timeline", () => {
    const { durationMs } = createEngine(config);
    const frames = getDurationInFrames(config, 30);
    expect(frames).toBe(Math.ceil((durationMs / 1000) * 30));
    // The last frame's timestamp reaches the end.
    expect(frameToMs(frames, 30)).toBeGreaterThanOrEqual(durationMs);
  });

  it("scales with fps and is always at least 1", () => {
    expect(getDurationInFrames(config, 60)).toBeGreaterThan(
      getDurationInFrames(config, 30),
    );
  });
});
