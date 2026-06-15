---
"@typecaast/react": patch
---

`<Typecaast>` now normalizes its `config` prop at runtime (applies schema
defaults like `pacing`), so a raw exported `typecaast.json` works directly —
previously it crashed in the engine with "Cannot read properties of undefined
(reading 'startDelayMs')". The `config` prop also accepts the widened type of an
imported JSON file (no more type error / pre-parsing), via the new exported
`TypecaastConfig`/`RawConfig` types.
