---
"@typecaast/core": patch
---

Reveal composer text by code point instead of UTF-16 unit during a
`composerType` animation, so an astral emoji (🎬, 🚀, …) is never split into a
lone surrogate mid-type — which rendered as a "missing glyph" (□ / blue diamond)
until the rest of the pair appeared.
