import { bench, describe } from "vitest";
import { compile } from "./engine/compile.js";
import { createGetStateAt } from "./engine/get-state-at.js";
import { makeBenchConfig } from "./bench/fixtures.js";

/**
 * Engine micro-benchmarks (PLAN §21, G.7). Run with `pnpm --filter @typecaast/core
 * bench`. Not part of `vitest run`, so they never flake CI; budgets live in
 * `docs/performance.md`. The engine is the hot path — `getStateAt` is sampled
 * once per frame (e.g. 30–60×/s live, and per exported frame), so it must stay
 * well under a frame budget even on a large thread.
 */

const big = makeBenchConfig(500);
const compiledBig = compile(big);
const getStateBig = createGetStateAt(compiledBig, "light");

// Pre-compute 1000 sample times spread across the timeline.
const samples = Array.from(
  { length: 1000 },
  (_, i) => (compiledBig.durationMs * i) / 1000,
);

describe("compile", () => {
  // compile() is memoized by config reference, so clone each iteration to force
  // a cache miss and measure a genuine cold compile (not the WeakMap hit).
  bench("compile a fresh 500-step config (cold)", () => {
    compile(structuredClone(big));
  });

  bench("re-compile the same config (memoized cache hit)", () => {
    compile(big);
  });
});

describe("getStateAt (500-step thread)", () => {
  bench("getStateAt × 1000 samples across the timeline", () => {
    for (const t of samples) getStateBig(t);
  });

  bench("getStateAt at the end (worst case: all messages visible)", () => {
    getStateBig(compiledBig.durationMs);
  });
});
