import type { Capabilities } from "@typecaast/core";
import {
  slotSkinFromDraft,
  type Skin,
  type SlotSkinDraft,
} from "@typecaast/skin-kit";
import { sanitizeHtml } from "./sanitize.js";
import type { SkinDraft } from "./draft.js";

/**
 * `TemplateSkinAdapter` — make a captured `SkinDraft` satisfy the `Skin`
 * contract by filling its slots at render time (PLAN §10). Template skins are
 * **untrusted regardless of source**, so the adapter (a) re-sanitizes every
 * template string and (b) delegates rendering to `slotSkinFromDraft` in
 * `@typecaast/skin-kit`, which mounts the sanitized HTML in an open shadow
 * root. Slot text is written via `textContent` (never `innerHTML`), so
 * authored content can't inject markup either.
 *
 * This is a faithful *playback* of the capture, not the final hand-tuned skin —
 * `typecaast scaffold-skin` turns the same draft into an editable React skin.
 */

export interface TemplateSkinOptions {
  /** Override the skin id (defaults to a slug of the draft name). */
  id?: string;
  capabilities?: Capabilities;
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "captured"
  );
}

const DEFAULT_CAPS: Capabilities = {
  events: {},
  content: {},
  reactions: false,
  threads: false,
  readReceipts: false,
};

/**
 * Build a runtime `Skin` from a captured `SkinDraft`, re-sanitising every
 * slot template up front. The actual rendering (shadow root, slot fill,
 * responsive frame wrapper) is delegated to
 * `slotSkinFromDraft` in `@typecaast/skin-kit`.
 */
export function templateSkinFromDraft(
  draft: SkinDraft,
  opts: TemplateSkinOptions = {},
): Skin {
  const safeDraft: SlotSkinDraft = {
    meta: {
      name: draft.meta.name,
      theme: draft.meta.theme,
      canvas: draft.meta.canvas,
      capturedAt: (
        draft.meta as { capturedAt?: SlotSkinDraft["meta"]["capturedAt"] }
      ).capturedAt,
    },
    slots: {
      frame: draft.slots.frame ? sanitizeHtml(draft.slots.frame) : undefined,
      message: draft.slots.message
        ? sanitizeHtml(draft.slots.message)
        : undefined,
      composer: draft.slots.composer
        ? sanitizeHtml(draft.slots.composer)
        : undefined,
      typing: draft.slots.typing ? sanitizeHtml(draft.slots.typing) : undefined,
    },
    css: draft.css ?? "",
    tokens: { colors: draft.tokens.colors ?? {} },
    darkTokens: draft.darkTokens
      ? { colors: draft.darkTokens.colors ?? {} }
      : undefined,
  };

  return slotSkinFromDraft(safeDraft, {
    id: opts.id ?? slug(draft.meta.name),
    capabilities: opts.capabilities ?? DEFAULT_CAPS,
  });
}
