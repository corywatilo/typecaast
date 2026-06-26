# @typecaast/capture

## 0.1.1

### Patch Changes

- Updated dependencies [61811b8]
  - @typecaast/skin-kit@0.4.1

## 0.1.0

### Minor Changes

- 854dea0: Pipeline improvements + a new `slotSkinFromDraft` skin-kit export, plus a few cursor papercuts:

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

### Patch Changes

- Updated dependencies [854dea0]
  - @typecaast/skin-kit@0.4.0

## 0.0.8

### Patch Changes

- Updated dependencies [3d0f6f7]
  - @typecaast/core@0.4.0
  - @typecaast/skin-kit@0.3.2

## 0.0.7

### Patch Changes

- Updated dependencies [be501a8]
  - @typecaast/skin-kit@0.3.1

## 0.0.6

### Patch Changes

- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
- Updated dependencies [49ad1e0]
- Updated dependencies [33a0c23]
  - @typecaast/core@0.3.0
  - @typecaast/schema@0.2.1
  - @typecaast/skin-kit@0.3.0

## 0.0.5

### Patch Changes

- Updated dependencies [36e0f43]
  - @typecaast/skin-kit@0.2.3

## 0.0.4

### Patch Changes

- 9c84658: Move `zod` from `peerDependencies` to `dependencies`. zod is an internal
  implementation detail of Typecaast's schema — consumers pass plain JSON configs
  and never import our zod schemas — so requiring them to provide `zod@^4`
  themselves was wrong. As a peer it broke installs in apps that already depend on
  `zod@^3` (e.g. via `openai`): pnpm reported `Conflicting peer dependencies: zod`
  and silently refused to upgrade. As a regular dependency, our `zod@4` is
  installed in isolation and coexists with the consumer's `zod@3`.
- Updated dependencies [9c84658]
  - @typecaast/skin-kit@0.2.2

## 0.0.3

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/skin-kit@0.2.1

## 0.0.2

### Patch Changes

- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/skin-kit@0.2.0
  - @typecaast/core@0.1.1

## 0.0.1

### Patch Changes

- Updated dependencies [27bf6bc]
  - @typecaast/schema@0.1.0
  - @typecaast/core@0.1.0
  - @typecaast/skin-kit@0.1.0
