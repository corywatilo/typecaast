import type { Config } from "@typecaast/schema";
import { getDurationInFrames } from "./timing.js";

/** Built-in aspect-ratio presets (social/video sizes). */
export const ASPECT_PRESETS = {
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "4:5": { width: 1080, height: 1350 },
} as const;

export type AspectPreset = keyof typeof ASPECT_PRESETS;

export interface CompositionMetadata {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
}

export interface MetadataOptions {
  /** Override fps (default `config.meta.fps`). */
  fps?: number;
  /** Explicit output width (overrides canvas). */
  width?: number;
  /** Explicit output height (overrides canvas). */
  height?: number;
  /** Or an aspect preset, applied when explicit width/height aren't given. */
  aspect?: AspectPreset;
}

/**
 * Resolve a config + options into Remotion composition metadata. Output size
 * comes from explicit width/height, else an aspect preset, else `meta.canvas`.
 * The retina **scale factor** is a render-time flag (not a dimension change),
 * applied by the CLI to `renderMedia` so the same composition exports crisply.
 */
export function getCompositionMetadata(
  config: Config,
  options: MetadataOptions = {},
): CompositionMetadata {
  const fps = options.fps ?? config.meta.fps;
  const preset = options.aspect ? ASPECT_PRESETS[options.aspect] : undefined;
  return {
    width: options.width ?? preset?.width ?? config.meta.canvas.width,
    height: options.height ?? preset?.height ?? config.meta.canvas.height,
    fps,
    durationInFrames: getDurationInFrames(config, fps),
  };
}
