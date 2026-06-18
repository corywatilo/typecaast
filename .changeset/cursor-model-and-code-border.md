---
"@typecaast/core": minor
"@typecaast/skin-kit": patch
"@typecaast/skins": patch
"@typecaast/builder": patch
---

Skin components' `Composer` now receives the skin's `options` (mirroring
`FrameProps.options`), so a skin can label reply-box chrome from config. The
**Cursor** skin uses it for a new **`model`** option — the reply box's model chip
(defaults to "Mythos", editable in the builder). Cursor code snippets also get a
hairline border to match Cursor's outlined code style.
