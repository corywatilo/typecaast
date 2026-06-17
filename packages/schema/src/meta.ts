import { z } from "zod";

/** A pixel dimension pair (authoring reference; the exact frame for video). */
export const sizeSchema = z.object({
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type Size = z.infer<typeof sizeSchema>;

/**
 * How the rendered conversation fills its container.
 * - `reflow`: container queries + ResizeObserver; bubbles re-wrap on small screens.
 * - `scale`: CSS transform scale-to-fit, preserves exact layout.
 * - `fixed`: clip to canvas.
 */
export const fitModeSchema = z.enum(["reflow", "scale", "fixed"]);
export type FitMode = z.infer<typeof fitModeSchema>;

/**
 * Reply-box (composer) visibility:
 * - `auto`: shown only while someone is typing/sending (default).
 * - `always`: keep the message input visible the whole time.
 * - `never`: never show it.
 */
export const composerModeSchema = z.enum(["auto", "always", "never"]);
export type ComposerMode = z.infer<typeof composerModeSchema>;

/**
 * Color theme. `auto` inherits the host page's `prefers-color-scheme` (live
 * preview) and falls back to `light`; video export resolves `auto` to a
 * concrete mode and defaults to `light` when unspecified.
 */
export const themeModeSchema = z.enum(["light", "dark", "auto"]);
export type ThemeMode = z.infer<typeof themeModeSchema>;

/**
 * Asset resolution strategy.
 * - `inline`: embed images as data URLs (self-contained config; default).
 * - `url`: reference hosted images (smaller config; user hosts their own).
 */
export const assetModeSchema = z.enum(["inline", "url"]);
export type AssetMode = z.infer<typeof assetModeSchema>;

/** Reference to a skin plus its skin-specific options (validated by the skin). */
export const skinRefSchema = z.object({
  id: z.string().min(1),
  options: z.record(z.string(), z.unknown()).optional(),
});
export type SkinRef = z.infer<typeof skinRefSchema>;

/** Top-level rendering/authoring metadata. */
export const metaSchema = z.object({
  /** Authoring reference size; fixed frame for video. */
  canvas: sizeSchema,
  fps: z.number().int().positive().default(30),
  fit: fitModeSchema.default("reflow"),
  theme: themeModeSchema.default("auto"),
  skin: skinRefSchema,
  /** Seed for all deterministic jitter (no `Math.random`). */
  seed: z.number().int().default(42),
  /** Canvas background: `"transparent"` or any CSS color. */
  background: z.string().default("transparent"),
  assets: assetModeSchema.default("inline"),
  /** Reply-box visibility (see `composerModeSchema`). */
  composer: composerModeSchema.default("auto"),
  /**
   * Auto-replay when the timeline reaches the end. Honored by the builder
   * preview and by `<Typecaast>` when the consumer doesn't pass an explicit
   * `loop` prop.
   */
  loop: z.boolean().default(false),
});

/** `meta` as it appears after parsing (defaults applied). */
export type Meta = z.infer<typeof metaSchema>;
/** `meta` as authored (fields with defaults are optional). */
export type MetaInput = z.input<typeof metaSchema>;
