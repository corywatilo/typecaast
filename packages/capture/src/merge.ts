import type { SkinDraft } from "./draft.js";

/**
 * Light/dark double-capture (PLAN §10, M5.7). Capture the *same* UI twice — once
 * per theme — then merge: keep the light capture's slot templates (structure is
 * identical) and attach the dark capture's tokens as `darkTokens`, so the
 * resulting skin supports both themes and switches CSS vars at render time.
 *
 * Structure is taken from `light`; only the dark *colors* differ between a
 * well-built light/dark UI, which is exactly what we want to vary.
 */
export function mergeThemeDrafts(light: SkinDraft, dark: SkinDraft): SkinDraft {
  return {
    ...light,
    meta: { ...light.meta, theme: undefined },
    tokens: light.tokens,
    darkTokens: dark.tokens,
    warnings: [
      ...light.warnings,
      ...(dark.detection.message.found
        ? []
        : ["Dark capture found no message row; reusing light structure."]),
    ],
  };
}
