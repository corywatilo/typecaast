import { z } from "zod";
import { metaSchema } from "./meta.js";
import { participantsSchema } from "./participants.js";
import { pacingSchema } from "./pacing.js";
import { timelineSchema } from "./timeline.js";

/**
 * The config schema version. Distinct from the `@typecaast/schema` package
 * version (related but versioned independently — see PLAN §22). A config newer
 * than the installed runtime fails parsing with a clear error.
 */
export const CONFIG_VERSION = 1;

/** The complete Typecaast config: the single source of truth for a simulation. */
export const configSchema = z.object({
  version: z.literal(CONFIG_VERSION),
  meta: metaSchema,
  participants: participantsSchema,
  /** Optional; omitted pacing resolves to the full default model. */
  pacing: pacingSchema.default(() => pacingSchema.parse({})),
  timeline: timelineSchema,
});

/** A parsed config (defaults applied). */
export type Config = z.infer<typeof configSchema>;
/** A config as authored (fields with defaults are optional). */
export type ConfigInput = z.input<typeof configSchema>;

/**
 * Generate the JSON Schema for a Typecaast config (for editor autocomplete and
 * `$schema` references). Lazy so importing the package never eagerly runs the
 * conversion. Refinements (e.g. the lenient content-node guard) are not
 * representable in JSON Schema and are dropped.
 */
export function configJsonSchema(): Record<string, unknown> {
  return z.toJSONSchema(configSchema, {
    unrepresentable: "any",
    target: "draft-7",
  }) as Record<string, unknown>;
}
