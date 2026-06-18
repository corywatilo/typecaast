# @typecaast/cli

## 0.1.4

### Patch Changes

- Updated dependencies [9c84658]
  - @typecaast/capture@0.0.4
  - @typecaast/remotion@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/capture@0.0.3
  - @typecaast/remotion@0.1.3

## 0.1.2

### Patch Changes

- @typecaast/capture@0.0.2
- @typecaast/remotion@0.1.2

## 0.1.1

### Patch Changes

- @typecaast/capture@0.0.2
- @typecaast/remotion@0.1.1

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
  - @typecaast/remotion@0.1.0
  - @typecaast/capture@0.0.1
