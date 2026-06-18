---
"@typecaast/skins": patch
---

Skin polish: the Slack reaction tooltip ("X reacted with :emoji:") is now
**theme-aware and opaque** — it was hardcoded to the dark message colour, so on a
dark thread it read as transparent and on a light thread it clashed; it also had
an oversized font. The Slack system-card action buttons now **wrap** (the row
uses `flex-wrap`, each label stays on one line) instead of breaking the text onto
two lines at narrow widths. Telegram's reactor tooltip is now solid (was
semi-transparent).
