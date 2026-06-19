import { z } from "zod";

/**
 * A `SkinDraft` is what the distiller emits from a captured chat UI: sanitized,
 * slotted HTML templates (with inline styles), extracted design tokens, and a
 * detection report describing what was auto-identified vs. what still needs a
 * human pass (PLAN §10). A draft is *not* a finished skin — `scaffold-skin`
 * turns one into an editable template-skin package, and the capture quality bar
 * (§10) decides whether it ships as a skin or stays "draft only".
 *
 * Slot tokens are double-brace placeholders the `TemplateSkinAdapter` fills:
 *   frame:    `{{messages}}`            — where the message list mounts
 *   message:  `{{author}}` `{{avatar}}` `{{body}}` `{{time}}`
 *   composer: `{{composer}}`
 *   typing:   `{{author}}`
 */

export const SLOT_TOKENS = {
  messages: "{{messages}}",
  author: "{{author}}",
  avatar: "{{avatar}}",
  body: "{{body}}",
  time: "{{time}}",
  composer: "{{composer}}",
} as const;

export type SlotName = "frame" | "message" | "composer" | "typing";

/** Per-slot detection outcome — drives the quality-bar metric (§10). */
export const slotReportSchema = z.object({
  /** Whether this region was found at all. */
  found: z.boolean(),
  /** Which inner slots were auto-detected (e.g. `["author","body"]`). */
  detected: z.array(z.string()),
  /** Heuristic confidence 0..1 for the auto-detection. */
  confidence: z.number().min(0).max(1),
});
export type SlotReport = z.infer<typeof slotReportSchema>;

const tokenSetSchema = z.object({
  colors: z.record(z.string(), z.string()),
  fonts: z.record(z.string(), z.string()).optional(),
  space: z.record(z.string(), z.string()).optional(),
  radius: z.record(z.string(), z.string()).optional(),
});

export const skinDraftSchema = z.object({
  version: z.literal(1),
  meta: z.object({
    /** Human label, defaulted from the source title/host. */
    name: z.string(),
    /** Source page URL, when known (informational only). */
    sourceUrl: z.string().optional(),
    /** Theme the capture was taken under, when known. */
    theme: z.enum(["light", "dark"]).optional(),
    /** Suggested canvas from the captured element's box. */
    canvas: z
      .object({ width: z.number().int(), height: z.number().int() })
      .optional(),
    /**
     * Snapshot of the page context the draft was taken from. Used by the
     * slot-template renderer to expose a `--captured-viewport-width` CSS
     * variable so authored CSS can ratio-scale against the original
     * viewport instead of the (much smaller) playback canvas.
     */
    capturedAt: z
      .object({
        viewportWidth: z.number().int().optional(),
        viewportHeight: z.number().int().optional(),
        pixelRatio: z.number().optional(),
      })
      .optional(),
  }),
  /**
   * Slotted, sanitized HTML per region. Elements carry inline `style`
   * attributes; `css` holds anything inline styles can't express.
   */
  slots: z.object({
    frame: z.string().optional(),
    message: z.string().optional(),
    composer: z.string().optional(),
    typing: z.string().optional(),
  }),
  /** Best-effort extra CSS (pseudo-elements, keyframes) — may be empty. */
  css: z.string(),
  /** Extracted design tokens (best effort) — the primary/captured theme. */
  tokens: tokenSetSchema,
  /**
   * Dark-theme tokens from a paired capture (M5.7 double-capture flow). When
   * present, the skin supports both themes and switches CSS vars by theme.
   */
  darkTokens: tokenSetSchema.optional(),
  /** Detection report per region. */
  detection: z.object({
    frame: slotReportSchema,
    message: slotReportSchema,
    composer: slotReportSchema,
    typing: slotReportSchema,
  }),
  /** Human-readable warnings (hidden content dropped, slots missing, …). */
  warnings: z.array(z.string()),
  /**
   * Stylesheets the matched-CSS capture couldn't read (typically blocked by
   * CORS). Informational — the slot template still renders, just without
   * the rules those sheets defined.
   */
  cssSkipped: z.array(z.string()).optional(),
});

export type SkinDraft = z.infer<typeof skinDraftSchema>;

/** Overall slot-detection ratio used by the §10 quality bar (0..1). */
export function detectionScore(draft: SkinDraft): number {
  // The five core slots: message-row found, author, avatar, body, composer.
  const checks = [
    draft.detection.message.detected.includes("body"),
    draft.detection.message.detected.includes("author"),
    draft.detection.message.detected.includes("avatar"),
    draft.detection.message.detected.includes("time"),
    draft.detection.composer.found,
  ];
  return checks.filter(Boolean).length / checks.length;
}
