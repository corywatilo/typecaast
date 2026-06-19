---
"@typecaast/capture": minor
"@typecaast/skin-kit": minor
"@typecaast/skins": patch
---

Pipeline improvements + a new `slotSkinFromDraft` skin-kit export, plus a few cursor papercuts:

- `@typecaast/capture` — the distiller now inlines layout-bearing computed
  styles (width/max-width/flex/position/overflow/etc.) so Tailwind- and
  CSS-module-driven layouts survive into a small canvas instead of
  collapsing into vertical letter columns. A new `captureMatchedCss`
  helper walks `document.styleSheets` and keeps rules that match the
  captured subtree, so class-driven layout actually works inside the
  skin's shadow root. Composer detection broadened to accept
  `aria-label` patterns, walk up from `[contenteditable]` ancestors, and
  use a structural "next block sibling after the message list"
  fallback. `SkinDraft` gains optional `meta.capturedAt` (viewport
  context) and `cssSkipped` (CORS audit trail).

- `@typecaast/skin-kit` — new `slotSkinFromDraft` (and `SlotSkinDraft`
  type) builds a `Skin` from a slotted-HTML draft, the shape captures
  emit. Mounts the markup in a shadow root, injects matched CSS,
  normalises desktop-viewport margins, and exposes
  `--captured-viewport-width` to authored CSS. Replaces a workaround
  copy previously inlined in `@typecaast/skins`; `templateSkinFromDraft`
  in `@typecaast/capture` now delegates to it. **`react-dom` is now a
  peer dependency** (the renderer uses `createPortal`) alongside the
  existing `react` peer.

- `@typecaast/skins` (cursor) — code marks now wrap long unbreakable
  URLs (`overflow-wrap: anywhere`), system cards get a full hairline
  border (not just the accent stripe), and the composer sits tighter
  against the last message.
