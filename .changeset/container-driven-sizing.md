---
"@typecaast/react": minor
"@typecaast/schema": patch
---

`<Typecaast>` is now **container-driven** on both axes.

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
