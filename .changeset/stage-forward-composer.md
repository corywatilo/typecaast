---
"@typecaast/skin-kit": patch
---

`TypecaastStage` now forwards the resolved composer mode to the skin's `Frame`
(via the new `FrameProps.composer`), so chrome elements can react to reply-box
visibility.
