import type { Config } from "@typecaast/schema";
import type { GetStateAt, ResolvedTheme } from "@typecaast/core";
import {
  createMockBillingToastGetStateAt,
  MOCK_BILLING_TOAST_DURATION_MS,
  MOCK_BILLING_TOAST_STEPS,
} from "@typecaast/core/mocks";

export interface Engine {
  getStateAt: GetStateAt;
  durationMs: number;
  /** Step boundaries for stepNext/stepPrev. */
  steps: number[];
}

/**
 * ⚠️ M1-UI MOCK. Ignores the config's timeline and returns the faked
 * billing-toast engine so the player + skins can be built and validated
 * against the locked `SimState` contract before the real engine exists.
 *
 * M1-engine replaces this with `compile(config)` → `getStateAt`. The
 * `<Typecaast>` / `useTypecaast` API stays identical — only this adapter swaps.
 */
export function configToEngine(_config: Config, theme: ResolvedTheme): Engine {
  return {
    getStateAt: createMockBillingToastGetStateAt(theme),
    durationMs: MOCK_BILLING_TOAST_DURATION_MS,
    steps: MOCK_BILLING_TOAST_STEPS,
  };
}
