# @typecaast/skins

## 0.2.4

### Patch Changes

- f3c7490: Tighten the default canvas of every built-in skin so rendered content reads larger
  (less empty chrome). Desktop skins (Slack, Claude Code, Discord, macOS Messages) get a
  narrower window; phone skins (Telegram, iMessage, WhatsApp, Cursor) shrink proportionally.
  Aspect ratios are preserved on the correct side of square, so landscape/portrait
  classification is unchanged. No API change.
- 49ad1e0: iMessage: tie the on-screen keyboard to reply-box visibility — when the composer
  is hidden (`composer: "never"`), the keyboard hides with it.

  Tune several default canvases: Claude Code and macOS Messages are taller; Telegram,
  WhatsApp, and Cursor are a touch narrower (slightly larger content); Discord is a
  touch wider (slightly smaller content).

- 33a0c23: Typing indicators: never render the viewer's own "typing…" (you don't see
  yourself type — that's the composer). Add a `typingPlacement` skin meta option
  (`"thread"` default, or `"below-composer"`) and set Slack to show "X is typing…"
  below the reply box, matching the real app.

  WhatsApp: replace the emoji composer glyphs (🙂 / 🎤 / ➤) with real inline SVG
  icons.

- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
- Updated dependencies [49ad1e0]
- Updated dependencies [33a0c23]
  - @typecaast/core@0.3.0
  - @typecaast/schema@0.2.1
  - @typecaast/skin-kit@0.3.0

## 0.2.3

### Patch Changes

- Updated dependencies [36e0f43]
  - @typecaast/skin-kit@0.2.3

## 0.2.2

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

## 0.2.1

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/skin-kit@0.2.1

## 0.2.0

### Minor Changes

- a857c1e: Add a Telegram skin (Day/Night themes): bubble layout with tails and grouping,
  in-bubble time + read ticks, sender names on incoming, reaction pills with a
  who-reacted tooltip, an animated typing bubble, a paper-plane composer, and bot
  cards rendered as a message plus inline-keyboard buttons.
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
- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/skin-kit@0.2.0
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
  - @typecaast/skin-kit@0.1.0
