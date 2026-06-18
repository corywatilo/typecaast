---
"@typecaast/skin-kit": patch
"@typecaast/skins": patch
"@typecaast/capture": patch
---

Move `zod` from `peerDependencies` to `dependencies`. zod is an internal
implementation detail of Typecaast's schema — consumers pass plain JSON configs
and never import our zod schemas — so requiring them to provide `zod@^4`
themselves was wrong. As a peer it broke installs in apps that already depend on
`zod@^3` (e.g. via `openai`): pnpm reported `Conflicting peer dependencies: zod`
and silently refused to upgrade. As a regular dependency, our `zod@4` is
installed in isolation and coexists with the consumer's `zod@3`.
