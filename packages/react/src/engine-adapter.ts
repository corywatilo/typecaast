import type { Config } from "@typecaast/schema";
import {
  createEngine,
  type Capabilities,
  type EngineHandle,
  type ResolvedTheme,
} from "@typecaast/core";

export type Engine = EngineHandle;

/**
 * The single seam between a config and a playable engine. M1-UI ran this over a
 * hand-mocked timeline; M1-engine swaps in the real `compile` + `getStateAt`
 * here — and nothing else in the renderer changed (same `Engine` shape).
 *
 * Optional `capabilities` (from the active skin) drop unsupported events/content
 * from the sampled state while leaving the config intact.
 */
export function configToEngine(
  config: Config,
  theme: ResolvedTheme,
  capabilities?: Capabilities,
): Engine {
  return createEngine(config, theme, capabilities);
}
