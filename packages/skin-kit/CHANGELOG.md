# @typecaast/skin-kit

## 0.4.0

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

## 0.3.2

### Patch Changes

- 3d0f6f7: Skin components' `Composer` now receives the skin's `options` (mirroring
  `FrameProps.options`), so a skin can label reply-box chrome from config. The
  **Cursor** skin uses it for a new **`model`** option — the reply box's model chip
  (defaults to "Mythos", editable in the builder). Cursor code snippets also get a
  hairline border to match Cursor's outlined code style.
- Updated dependencies [3d0f6f7]
  - @typecaast/core@0.4.0

## 0.3.1

### Patch Changes

- be501a8: The message thread now **scrolls** when a conversation is taller than the
  available height, instead of clipping older messages out of reach. The viewport
  uses `flex-direction: column-reverse`, so the newest message and the composer
  stay pinned to the bottom and the thread loads + stays scrolled to the bottom
  with the top reachable — entirely in CSS, so it renders identically in a live
  embed, an SSR page, and a video frame (no scroll-to-bottom effect needed). The
  scrollbar is restyled to a subtle, hover-revealed thumb (scoped inline, so the
  embed still needs no external stylesheet) instead of the chunky OS default.

## 0.3.0

### Minor Changes

- 33a0c23: Typing indicators: never render the viewer's own "typing…" (you don't see
  yourself type — that's the composer). Add a `typingPlacement` skin meta option
  (`"thread"` default, or `"below-composer"`) and set Slack to show "X is typing…"
  below the reply box, matching the real app.

  WhatsApp: replace the emoji composer glyphs (🙂 / 🎤 / ➤) with real inline SVG
  icons.

### Patch Changes

- 49ad1e0: `TypecaastStage` now forwards the resolved composer mode to the skin's `Frame`
  (via the new `FrameProps.composer`), so chrome elements can react to reply-box
  visibility.
- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
  - @typecaast/core@0.3.0
  - @typecaast/schema@0.2.1

## 0.2.3

### Patch Changes

- 36e0f43: Fix `'Typecaast' cannot be used as a JSX component … 'ReactNode' is not a valid
JSX element` (ts2786) for consumers on older React type packages (e.g.
  `@types/react@16`/`@17`, as pinned by Gatsby 4). The exported components were
  annotated to return `ReactNode`, which those typings don't accept as a component
  return (they require `ReactElement | null`). The public components — `Typecaast`,
  `FitBox`, `TypecaastStage`, `ThemeProvider`, `MessageContent`, `TypingDots` — now
  return `ReactElement`, which is valid across React 16–19 type versions.

## 0.2.2

### Patch Changes

- 9c84658: Move `zod` from `peerDependencies` to `dependencies`. zod is an internal
  implementation detail of Typecaast's schema — consumers pass plain JSON configs
  and never import our zod schemas — so requiring them to provide `zod@^4`
  themselves was wrong. As a peer it broke installs in apps that already depend on
  `zod@^3` (e.g. via `openai`): pnpm reported `Conflicting peer dependencies: zod`
  and silently refused to upgrade. As a regular dependency, our `zod@4` is
  installed in isolation and coexists with the consumer's `zod@3`.

## 0.2.1

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0

## 0.2.0

### Minor Changes

- b2a8215: Zero-config skin resolution: `<Typecaast config={config} />` now resolves the
  skin from `config.meta.skin.id` (single source of truth) — the `skin` prop is
  optional and only needed for custom skins. Only the referenced skin's chunk is
  loaded (lazy per-skin via new `@typecaast/skins/<id>` subpath exports), and
  because just the serializable `config` is passed, the embed works directly in a
  React Server Component (Next.js App Router) with no `"use client"`.

  - `@typecaast/react`: `skin` is now optional; adds `loadBuiltinSkin`,
    `builtinSkinIds`, `BUILTIN_SKIN_LOADERS`; depends on `@typecaast/skins`.
  - `@typecaast/skins`: per-skin subpath exports (`@typecaast/skins/slack`, …),
    each with a default export.
  - `@typecaast/skin-kit`: `TypecaastStage` (+ `TypecaastStageProps`,
    `ComposerMode`) now live here; still re-exported from `@typecaast/react`.

### Patch Changes

- 2c9eb3a: Ship these packages as React **client modules** (a `"use client"` directive at
  the top of the built output). They use hooks and theme context (`createContext`
  at module scope), so loading them in a React Server Component graph (e.g. the
  Next.js App Router) previously crashed with `createContext is not a function`.
  The directive is added post-bundle because esbuild strips in-source/banner
  directives when bundling.
- Updated dependencies [a857c1e]
  - @typecaast/core@0.1.1

## 0.1.0

### Minor Changes

- 27bf6bc: Initial public beta of the Typecaast runtime + skins.

  - **Engine** (`@typecaast/core`): `compile(config)` + pure `getStateAt(t)`, seeded RNG, auto-pacing with overrides, capability resolution, the real-time `Player`, and the `SimState`/skin-prop contracts.
  - **Schema** (`@typecaast/schema`): versioned Zod config (meta/participants/pacing/content-node registry/timeline), generated JSON Schema, and reusable `validateConfig`.
  - **React renderer** (`@typecaast/react`): `<Typecaast>` + `useTypecaast`, reactive theme, font loading, fit modes.
  - **Video export** (`@typecaast/remotion`): frame-identical Remotion composition + a callable `renderVideo`.
  - **Skin kit** (`@typecaast/skin-kit`): the `Skin` contract, theme context, font loader, animation primitives, `MessageContent`.
  - **Skins** (`@typecaast/skins`): Slack, Claude Code (TUI), iMessage (iOS), WhatsApp — light + dark where applicable.
  - **CLI** (`@typecaast/cli`): `validate` and `render`.

### Patch Changes

- Updated dependencies [27bf6bc]
  - @typecaast/schema@0.1.0
  - @typecaast/core@0.1.0
