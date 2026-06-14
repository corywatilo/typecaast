/**
 * `@typecaast/capture` — turn a real chat UI into a Typecaast skin. The
 * distiller isolates the selected subtree, collapses the repeating message row
 * into a slotted template, scopes styles, and extracts tokens → a `SkinDraft`.
 * Captured markup is untrusted: it is allowlist-sanitized on the way in and
 * rendered in a shadow root by the `TemplateSkinAdapter` (PLAN §10). The
 * node-only saved-page importer lives at `@typecaast/capture/import`.
 */

export { sanitizeHtml, scrubCss, type SanitizeOptions } from "./sanitize.js";
export {
  skinDraftSchema,
  detectionScore,
  SLOT_TOKENS,
  type SkinDraft,
  type SlotName,
  type SlotReport,
} from "./draft.js";
export { distill, type DistillOptions } from "./distill.js";
export {
  templateSkinFromDraft,
  type TemplateSkinOptions,
} from "./template-skin.js";
