---
"@typecaast/react": minor
"@typecaast/skins": minor
"@typecaast/skin-kit": minor
---

Zero-config skin resolution: `<Typecaast config={config} />` now resolves the
skin from `config.meta.skin.id` (single source of truth) — the `skin` prop is
optional and only needed for custom skins. Only the referenced skin's chunk is
loaded (lazy per-skin via new `@typecaast/skins/<id>` subpath exports), and
because just the serializable `config` is passed, the embed works directly in a
React Server Component (Next.js App Router) with no `"use client"`.

- `@typecaast/react`: `skin` is now optional; adds `loadBuiltinSkin`,
  `builtinSkinIds`, `BUILTIN_SKIN_LOADERS`; depends on `@typecaast/skins`.
- `@typecaast/skins`: per-skin subpath exports (`@typecaast/skins/slack`, …),
  each with a default export.
- `@typecaast/skin-kit`: `TypecaastStage` (+ `TypecaastStageProps`,
  `ComposerMode`) now live here; still re-exported from `@typecaast/react`.
