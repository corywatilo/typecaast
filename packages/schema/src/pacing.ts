import { z } from "zod";

/**
 * Global auto-pacing defaults. Every value is overridable per step in the
 * timeline; the engine computes delays/durations from these and bakes in
 * seeded, deterministic jitter (`humanize`).
 */
export const pacingSchema = z.object({
  /** Gap before an incoming message ≈ reading time of the prior message. */
  readingWpm: z.number().positive().default(240),
  /** Chars/sec for composer typing + sender typing duration. */
  typingCps: z.number().positive().default(14),
  /** Lag between a message and a reaction landing. */
  reactionDelayMs: z.number().nonnegative().default(700),
  /** Baseline beat between messages. */
  interMessageGapMs: z.number().nonnegative().default(900),
  /** ±fraction of seeded jitter so pacing doesn't feel robotic (0–1). */
  humanize: z.number().min(0).max(1).default(0.15),
  /** Delay before the first event. */
  startDelayMs: z.number().nonnegative().default(400),
});
export type Pacing = z.infer<typeof pacingSchema>;
export type PacingInput = z.input<typeof pacingSchema>;
