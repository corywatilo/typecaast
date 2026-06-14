# Performance budgets

The engine is a pure function of time: `compile(config)` once, then
`getStateAt(t)` sampled **once per frame** — 30–60×/second in the live player,
and once per frame during a video export. So `getStateAt` is the hot path and
must stay far under a frame budget even on a large thread (PLAN §21, G.7).

## Budgets

Targets are for a **500-step thread** (`makeBenchConfig(500)`) on a modern
laptop. They carry deliberate headroom over measured values, so they catch gross
regressions, not noise.

| Operation                                      | Budget       | Measured (reference) | Notes                                                                           |
| ---------------------------------------------- | ------------ | -------------------- | ------------------------------------------------------------------------------- |
| `getStateAt(t)` — single call                  | **< 100 µs** | ~3–6 µs              | ~3000× under a 16.7 ms (60fps) frame; sampling cost is negligible.              |
| `getStateAt(t)` — 1000 samples across timeline | **< 30 ms**  | ~3.3 ms              | Whole-timeline scrub stays interactive.                                         |
| `compile(config)` — cold, 500 steps            | **< 20 ms**  | ~2 ms                | One-time at engine creation.                                                    |
| `compile(config)` — re-compile same config     | **free**     | cache hit            | Memoized by config reference (`WeakMap`); editing only the theme/options is ~0. |

Frame parity holds regardless of speed: the live player and the Remotion
renderer sample the _same_ `getStateAt`, so performance work can't change
output.

## Running the benchmarks

```bash
pnpm --filter @typecaast/core bench
```

Benchmarks live in `packages/core/src/engine.bench.ts` (Vitest `bench`); the
fixture generator is `src/bench/fixtures.ts`. They are **not** part of
`vitest run`, so they never flake CI — treat them as a local/manual regression
tool. Re-measure when you change the compiler or the sampler, and update the
"Measured" column if the characteristic changes.

## Why no hard CI gate

Wall-clock micro-benchmarks vary too much across CI runners to assert on
reliably. The budgets above are the contract; the bench is how you check them.
If a change pushes `getStateAt` toward the budget, that's the signal to profile
before merging.
