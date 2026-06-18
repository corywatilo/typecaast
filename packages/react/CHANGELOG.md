# @typecaast/react

## 0.3.0

### Minor Changes

- b6179ee: `<Typecaast>` is now **container-driven** on both axes.

  Before, the widget grew taller as more steps played: `<Typecaast>`'s
  outer wrapper had `position: relative` with no width/height, the
  `FitBox` `reflow` mode set only `width: 100%`, and the bottom-anchored
  thread inside the skin only clipped when the parent gave it a definite
  height. So embedding `<Typecaast>` in a responsive grid (without an
  explicit height on the wrapper) meant the widget was content-driven and
  never filled the host's width.

  Now:

  - The outer wrapper defaults to `width: 100%`, `height: 100%`, and
    `aspect-ratio: canvas.w / canvas.h`. Pass an explicit `style` to
    override; otherwise the widget fills its host. When the host gives
    only a width (responsive grid, no fixed-height container), the
    authored canvas's aspect-ratio derives the height instead of message
    content.
  - `FitBox` `reflow` adds `height: 100%` so the height chain reaches the
    skin Frame; the bottom-anchored thread + `overflow: hidden` clips
    older messages off the top instead of pushing the widget taller.

  The `meta.fit` schema doc is updated to describe the new
  container-driven semantics for `reflow` and `scale` (and the
  non-container-driven `fixed` mode).

  **Migration.** No code changes required for hosts that already wrap
  `<Typecaast>` in a sized container (e.g. `aspectRatio` + `fit="scale"`
  like the landing hero). Hosts that previously relied on the widget
  growing with content should give the wrapper an explicit height (or
  override with a `style` prop) to opt back in.

### Patch Changes

- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
- Updated dependencies [f3c7490]
- Updated dependencies [49ad1e0]
- Updated dependencies [49ad1e0]
- Updated dependencies [33a0c23]
  - @typecaast/core@0.3.0
  - @typecaast/schema@0.2.1
  - @typecaast/skins@0.2.4
  - @typecaast/skin-kit@0.3.0

## 0.2.5

### Patch Changes

- 36e0f43: Fix `'Typecaast' cannot be used as a JSX component … 'ReactNode' is not a valid
JSX element` (ts2786) for consumers on older React type packages (e.g.
  `@types/react@16`/`@17`, as pinned by Gatsby 4). The exported components were
  annotated to return `ReactNode`, which those typings don't accept as a component
  return (they require `ReactElement | null`). The public components — `Typecaast`,
  `FitBox`, `TypecaastStage`, `ThemeProvider`, `MessageContent`, `TypingDots` — now
  return `ReactElement`, which is valid across React 16–19 type versions.
- Updated dependencies [36e0f43]
  - @typecaast/skin-kit@0.2.3
  - @typecaast/skins@0.2.3

## 0.2.4

### Patch Changes

- 1ad9881: Fix `(0, react.use) is not a function` on React 18. The zero-config skin path
  (no `skin` prop) resolved the lazily-imported skin with React 19's `use()` hook,
  which doesn't exist on React 18 — so `<Typecaast>` crashed in React 18 apps
  (e.g. Gatsby) even though the package advertises `react >=18`. It now suspends
  via the universal throw-the-promise Suspense primitive, which behaves
  identically on React 18 and 19.

## 0.2.3

### Patch Changes

- Updated dependencies [9c84658]
  - @typecaast/skin-kit@0.2.2
  - @typecaast/skins@0.2.2

## 0.2.2

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/skin-kit@0.2.1
  - @typecaast/skins@0.2.1

## 0.2.1

### Patch Changes

- 97da731: `<Typecaast>` now normalizes its `config` prop at runtime (applies schema
  defaults like `pacing`), so a raw exported `typecaast.json` works directly —
  previously it crashed in the engine with "Cannot read properties of undefined
  (reading 'startDelayMs')". The `config` prop also accepts the widened type of an
  imported JSON file (no more type error / pre-parsing), via the new exported
  `TypecaastConfig`/`RawConfig` types.

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
- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/skin-kit@0.2.0
  - @typecaast/skins@0.2.0
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
