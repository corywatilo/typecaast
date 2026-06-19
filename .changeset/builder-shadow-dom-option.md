---
"@typecaast/builder": patch
---

Add a **"Render in shadow DOM"** toggle to the Export → Code "Options" group
(next to Responsive + Loop). When on, the generated embed snippet adds the
`isolate` prop and a `"use client"` line, so the copied code is correct for the
client-only isolated mode. A tooltip + docs link explains the trade-off.
