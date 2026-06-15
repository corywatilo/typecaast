---
"@typecaast/builder": minor
---

Builder/playground UX: preview zoom with Fit/Responsive modes (large canvases no
longer render tiny), the `+ Step` control sits below the steps and sticks to the
pane only on overflow (and scrolls the new step into view), Import moved to the
Timeline/Cast row, and the exported embed snippet is now zero-config
(`<Typecaast config={config} />` — no skin import, no `"use client"`) with an
`npm install @typecaast/react` line. The `send` step editor drops the redundant
From field (it inherits the composer's sender).
