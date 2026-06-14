/**
 * Deterministic PRNG. The engine must never call `Math.random()` (PLAN §3) —
 * all jitter flows from the config `seed` through this, so `compile` is a pure
 * function of (config) and the same seed always yields the same timeline.
 */

/** Mulberry32 — small, fast, fully deterministic. Returns floats in [0, 1). */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Apply ±`fraction` jitter to a value, consuming one RNG draw. With
 * `fraction = 0` the value is returned unchanged (no draw consumed) so disabling
 * humanization is exact.
 */
export function withJitter(
  rng: () => number,
  value: number,
  fraction: number,
): number {
  if (fraction <= 0) return value;
  const delta = (rng() * 2 - 1) * fraction;
  return value * (1 + delta);
}
