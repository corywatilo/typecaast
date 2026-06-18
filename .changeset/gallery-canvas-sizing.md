---
"@typecaast/skins": patch
---

Tighten the default canvas of every built-in skin so rendered content reads larger
(less empty chrome). Desktop skins (Slack, Claude Code, Discord, macOS Messages) get a
narrower window; phone skins (Telegram, iMessage, WhatsApp, Cursor) shrink proportionally.
Aspect ratios are preserved on the correct side of square, so landscape/portrait
classification is unchanged. No API change.
