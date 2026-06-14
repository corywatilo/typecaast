/**
 * `@typecaast/core` — the framework-agnostic engine and, locked first, the
 * contracts the rest of the system builds against: `SimState` (the renderable
 * state), the skin-prop data types, and the `Player` interface.
 *
 * The engine implementation (`compile` + `getStateAt`) lands in M1-engine,
 * behind these same contracts.
 */

/** Contract version for the SimState/Player/skin-prop surface. */
export const CORE_CONTRACT_VERSION = 1;

export type * from "./sim-state.js";
export type * from "./skin-props.js";
export type * from "./player.js";
