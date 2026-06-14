import { createEngine } from "@typecaast/core";
import type { Config } from "@typecaast/schema";

/** Convert a Remotion frame index to a timeline timestamp in ms. */
export function frameToMs(frame: number, fps: number): number {
  return (frame / fps) * 1000;
}

/**
 * Composition length in frames for a config at a given fps. Derived from the
 * compiled timeline's duration (theme-independent), rounded up so the final
 * frame holds.
 */
export function getDurationInFrames(config: Config, fps: number): number {
  const { durationMs } = createEngine(config);
  return Math.max(1, Math.ceil((durationMs / 1000) * fps));
}
