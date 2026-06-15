/**
 * `@typecaast/react` — the embeddable real-time renderer. `<Typecaast>` mounts
 * the player and renders a skin from live `SimState`; `useTypecaast` exposes
 * the controls for custom UIs (and the builder's preview-as-you-go editing).
 *
 * Client module: the build prepends a `"use client"` directive to the bundled
 * output (see tsup.config + scripts/prepend-use-client.mjs), so `<Typecaast>`
 * drops straight into a Server Component (e.g. the Next.js App Router) without
 * the consumer marking anything. (An in-source directive is stripped by
 * esbuild's bundle pass, hence the post-build step.)
 */

export { Typecaast, type TypecaastProps } from "./typecaast.js";
export {
  useTypecaast,
  type UseTypecaastOptions,
  type TypecaastControls,
} from "./use-typecaast.js";
export {
  TypecaastStage,
  type TypecaastStageProps,
  type ComposerMode,
} from "./stage.js";
export { resolveTheme } from "./resolve-theme.js";
export { useResolvedTheme, usePrefersDark } from "./use-resolved-theme.js";
export { useReducedMotion } from "./use-reduced-motion.js";
export { useSkinFonts, type FontLoadState } from "./use-skin-fonts.js";
export { FitBox, type FitBoxProps } from "./fit-box.js";
export { buildTranscript, type TranscriptLine } from "./transcript.js";
