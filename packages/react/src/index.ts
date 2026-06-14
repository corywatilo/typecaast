/**
 * `@typecaast/react` — the embeddable real-time renderer. `<Typecaast>` mounts
 * the player and renders a skin from live `SimState`; `useTypecaast` exposes
 * the controls for custom UIs (and the builder's preview-as-you-go editing).
 */

export { Typecaast, type TypecaastProps } from "./typecaast.js";
export {
  useTypecaast,
  type UseTypecaastOptions,
  type TypecaastControls,
} from "./use-typecaast.js";
export { TypecaastStage, type TypecaastStageProps } from "./stage.js";
export { resolveTheme } from "./resolve-theme.js";
