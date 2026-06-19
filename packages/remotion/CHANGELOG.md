# @typecaast/remotion

## 0.1.11

### Patch Changes

- Updated dependencies [854dea0]
  - @typecaast/skin-kit@0.4.0
  - @typecaast/skins@0.3.2
  - @typecaast/react@0.5.1

## 0.1.10

### Patch Changes

- Updated dependencies [afd7111]
  - @typecaast/react@0.5.0

## 0.1.9

### Patch Changes

- Updated dependencies [3d0f6f7]
- Updated dependencies [6537d63]
- Updated dependencies [d5b3c8f]
  - @typecaast/core@0.4.0
  - @typecaast/skin-kit@0.3.2
  - @typecaast/skins@0.3.1
  - @typecaast/react@0.4.0

## 0.1.8

### Patch Changes

- Updated dependencies [b12dff8]
- Updated dependencies [bd032dc]
- Updated dependencies [be501a8]
  - @typecaast/skins@0.3.0
  - @typecaast/skin-kit@0.3.1
  - @typecaast/react@0.3.1

## 0.1.7

### Patch Changes

- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
- Updated dependencies [f3c7490]
- Updated dependencies [49ad1e0]
- Updated dependencies [49ad1e0]
- Updated dependencies [33a0c23]
  - @typecaast/core@0.3.0
  - @typecaast/react@0.3.0
  - @typecaast/schema@0.2.1
  - @typecaast/skins@0.2.4
  - @typecaast/skin-kit@0.3.0

## 0.1.6

### Patch Changes

- Updated dependencies [36e0f43]
  - @typecaast/react@0.2.5
  - @typecaast/skin-kit@0.2.3
  - @typecaast/skins@0.2.3

## 0.1.5

### Patch Changes

- Updated dependencies [1ad9881]
  - @typecaast/react@0.2.4

## 0.1.4

### Patch Changes

- Updated dependencies [9c84658]
  - @typecaast/skin-kit@0.2.2
  - @typecaast/skins@0.2.2
  - @typecaast/react@0.2.3

## 0.1.3

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/react@0.2.2
  - @typecaast/skin-kit@0.2.1
  - @typecaast/skins@0.2.1

## 0.1.2

### Patch Changes

- Updated dependencies [97da731]
  - @typecaast/react@0.2.1

## 0.1.1

### Patch Changes

- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/react@0.2.0
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
  - @typecaast/react@0.1.0
  - @typecaast/skin-kit@0.1.0
  - @typecaast/skins@0.1.0
