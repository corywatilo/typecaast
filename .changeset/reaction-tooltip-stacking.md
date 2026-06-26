---
"@typecaast/skin-kit": patch
---

Reset `fadeSlideIn` to `transform: none` once settled. A residual `translateY(0px)` on every revealed message created a stacking context that trapped descendant overlays — so a reaction's hover tooltip rendered _below_ later sibling messages and their text bled over its opaque background, making it read as transparent. Settled messages now drop the transform, letting the Slack/Telegram reaction tooltips layer above neighbouring content in both light and dark mode.
