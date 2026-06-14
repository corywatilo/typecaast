import type { Config } from "@typecaast/schema";
import type { GetStateAt } from "../player.js";
import type { ResolvedTheme } from "../sim-state.js";
import type { Capabilities } from "./capabilities.js";
import { compile } from "./compile.js";
import { createGetStateAt } from "./get-state-at.js";
import { resolveCapabilities } from "./capabilities.js";

export { compile } from "./compile.js";
export { sampleState, createGetStateAt } from "./get-state-at.js";
export {
  createPlayer,
  TimelinePlayer,
  type PlayerOptions,
} from "./create-player.js";
export { createRng, withJitter } from "./rng.js";
export { graphemeCount, typingDurationMs, readingDelayMs } from "./pacing.js";
export {
  resolveCapabilities,
  type Capabilities,
  type EventCapability,
} from "./capabilities.js";
export type * from "./compiled.js";

/** A ready-to-drive engine: a sampler plus what a player needs. */
export interface EngineHandle {
  getStateAt: GetStateAt;
  durationMs: number;
  /** Step boundaries for stepNext/stepPrev. */
  steps: number[];
}

/**
 * Compile a config and bind a theme into a ready engine — the one call a
 * renderer needs. `compile` is memoized, so re-creating an engine for the same
 * config (e.g. only the theme changed) is cheap.
 */
export function createEngine(
  config: Config,
  theme: ResolvedTheme = "light",
  capabilities?: Capabilities,
): EngineHandle {
  let compiled = compile(config);
  if (capabilities) compiled = resolveCapabilities(compiled, capabilities);
  return {
    getStateAt: createGetStateAt(compiled, theme),
    durationMs: compiled.durationMs,
    steps: compiled.stepBoundaries,
  };
}
