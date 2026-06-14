import { describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { ASPECT_PRESETS, getCompositionMetadata } from "./metadata.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 880, height: 720 }, fps: 30, skin: { id: "slack" } },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [{ type: "message", from: "a", text: "hi" }],
});

describe("getCompositionMetadata", () => {
  it("defaults to the canvas size and config fps", () => {
    const m = getCompositionMetadata(config);
    expect(m.width).toBe(880);
    expect(m.height).toBe(720);
    expect(m.fps).toBe(30);
    expect(m.durationInFrames).toBeGreaterThan(0);
  });

  it("applies an aspect preset", () => {
    const m = getCompositionMetadata(config, { aspect: "9:16" });
    expect(m.width).toBe(ASPECT_PRESETS["9:16"].width);
    expect(m.height).toBe(ASPECT_PRESETS["9:16"].height);
  });

  it("explicit width/height win over a preset", () => {
    const m = getCompositionMetadata(config, {
      aspect: "16:9",
      width: 1280,
      height: 720,
    });
    expect(m.width).toBe(1280);
    expect(m.height).toBe(720);
  });

  it("recomputes duration when fps changes (≈ doubles at 2× fps)", () => {
    const f30 = getCompositionMetadata(config, { fps: 30 }).durationInFrames;
    const f60 = getCompositionMetadata(config, { fps: 60 }).durationInFrames;
    expect(Math.abs(f60 - f30 * 2)).toBeLessThanOrEqual(1);
  });
});
