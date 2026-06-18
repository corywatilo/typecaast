---
"@typecaast/schema": minor
"@typecaast/core": minor
---

Publish the timeline pacing change that already shipped to the playground: the
`beat` step is renamed to **`delay`** (`{ "type": "delay", "duration": <ms> }`),
and the per-step `delay`/`holdAfter` overrides are replaced by that explicit
`delay` step (the base step shape is now just `id` + `instant`). Configs that
used `beat`, or per-step `delay`/`holdAfter`, must migrate. This was already in
the deployed playground but never released, so configs exported from it failed
validation against the older published packages.
