---
"@typecaast/builder": patch
---

Rework the sizing controls around a clearer model. The 3-way **Fit** dropdown is
gone; **Options** now shows the canvas **Size preset + Width/Height** always (the
authoring/preview size, also the video frame size and the responsive fallback
aspect ratio). The reflow-vs-scale choice moves to **Export → Code** as a
**"Responsive widget"** checkbox (on by default): on = the embed fills its parent
(`fit: "reflow"`), off = it downscales to fit the parent preserving aspect ratio
(`fit: "scale"`). Video still renders at the canvas dimensions. (`"fixed"` is no
longer offered in the builder but remains valid in the schema for older configs.)
