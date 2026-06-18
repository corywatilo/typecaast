# @typecaast/core

## 0.4.0

### Minor Changes

- 3d0f6f7: Skin components' `Composer` now receives the skin's `options` (mirroring
  `FrameProps.options`), so a skin can label reply-box chrome from config. The
  **Cursor** skin uses it for a new **`model`** option — the reply box's model chip
  (defaults to "Mythos", editable in the builder). Cursor code snippets also get a
  hairline border to match Cursor's outlined code style.

## 0.3.0

### Minor Changes

- 49ad1e0: Add an optional `composer` (resolved `ComposerMode`) field to `FrameProps` so a
  skin's chrome can mirror reply-box visibility. iMessage uses it to hide the
  on-screen keyboard when the composer is hidden; other skins can ignore it.

### Patch Changes

- 33a0c23: Reveal composer text by code point instead of UTF-16 unit during a
  `composerType` animation, so an astral emoji (🎬, 🚀, …) is never split into a
  lone surrogate mid-type — which rendered as a "missing glyph" (□ / blue diamond)
  until the rest of the pair appeared.
- Updated dependencies [b6179ee]
  - @typecaast/schema@0.2.1

## 0.2.0

### Minor Changes

- c165c9a: Publish the timeline pacing change that already shipped to the playground: the
  `beat` step is renamed to **`delay`** (`{ "type": "delay", "duration": <ms> }`),
  and the per-step `delay`/`holdAfter` overrides are replaced by that explicit
  `delay` step (the base step shape is now just `id` + `instant`). Configs that
  used `beat`, or per-step `delay`/`holdAfter`, must migrate. This was already in
  the deployed playground but never released, so configs exported from it failed
  validation against the older published packages.

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0

## 0.1.1

### Patch Changes

- a857c1e: Fix: a sent message inherits the composer's sender. `send` commits whatever's in
  the composer, so the message is now always from whoever was typing — previously a
  stray `from` on the send step (e.g. a self-default) could mis-attribute it.

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
