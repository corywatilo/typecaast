/**
 * `@typecaast/skin-kit` — the surface skin authors build against: the `Skin`
 * contract + capability/token types, a `defineSkin` helper, the theme context,
 * and the web-font loader. Component prop types come from `@typecaast/core`.
 *
 * Client module: the build prepends `"use client"` to the bundled output (see
 * tsup.config + scripts/prepend-use-client.mjs) since it exports React context
 * + hooks, so it loads correctly inside RSC trees.
 */

export * from "./types.js";
export * from "./define-skin.js";
export * from "./theme.js";
export * from "./fonts.js";
export * from "./animation.js";
export * from "./content.js";
export {
  TypecaastStage,
  type TypecaastStageProps,
  type ComposerMode,
} from "./stage.js";
export {
  slotSkinFromDraft,
  type SlotSkinDraft,
  type SlotSkinOptions,
} from "./slot-skin.js";
