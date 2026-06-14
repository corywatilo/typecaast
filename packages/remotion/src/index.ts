/**
 * `@typecaast/remotion` — deterministic video export. The composition samples
 * the same engine + renders the same skins as `@typecaast/react`, one frame at
 * a time, so the live preview and the exported video are identical.
 */

export {
  TypecaastComposition,
  type TypecaastCompositionProps,
} from "./composition.js";
export { frameToMs, getDurationInFrames } from "./timing.js";
export { useRemotionFonts } from "./fonts.js";
// Note: the Node renderer is the `@typecaast/remotion/render` subpath
// (renderVideo) — kept separate so importing the composition stays browser-only.
export {
  getCompositionMetadata,
  ASPECT_PRESETS,
  type AspectPreset,
  type CompositionMetadata,
  type MetadataOptions,
} from "./metadata.js";
