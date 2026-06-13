/**
 * `@typecaast/schema` — the versioned, Zod-validated config schema.
 *
 * One source of truth: the builder, CLI, docs, and runtime all validate against
 * these schemas and derive their TS types from them (`z.infer`).
 */

export * from "./meta.js";
export * from "./participants.js";
export * from "./pacing.js";
