---
"@typecaast/core": minor
---

Add an optional `composer` (resolved `ComposerMode`) field to `FrameProps` so a
skin's chrome can mirror reply-box visibility. iMessage uses it to hide the
on-screen keyboard when the composer is hidden; other skins can ignore it.
