---
"@typecaast/skins": minor
---

Claude Code (TUI) and Discord now support a **light** theme in addition to dark.
Each skin's palette is keyed by theme (`COLORS[theme]`) with a new light variant,
and `supportsThemes` is `["dark", "light"]` — so the builder's App-tab "Supported
features" lists Light and the preview/theme toggle renders it.
