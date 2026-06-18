# @typecaast/skin-kit

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
