# @typecaast/schema

## 0.2.1

### Patch Changes

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

## 0.2.0

### Minor Changes

- c165c9a: Publish the timeline pacing change that already shipped to the playground: the
  `beat` step is renamed to **`delay`** (`{ "type": "delay", "duration": <ms> }`),
  and the per-step `delay`/`holdAfter` overrides are replaced by that explicit
  `delay` step (the base step shape is now just `id` + `instant`). Configs that
  used `beat`, or per-step `delay`/`holdAfter`, must migrate. This was already in
  the deployed playground but never released, so configs exported from it failed
  validation against the older published packages.

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
