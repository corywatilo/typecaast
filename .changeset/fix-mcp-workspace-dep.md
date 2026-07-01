---
"@typecaast/mcp": patch
---

Fix the broken `0.1.0`, which shipped an unresolved `"@typecaast/schema":
"workspace:*"` dependency and failed to install (`EUNSUPPORTEDPROTOCOL`). The
first publish was done manually with `npm publish`, which — unlike `pnpm
publish` and the automated release — doesn't rewrite pnpm's `workspace:`
protocol. Republished through the normal pnpm/OIDC pipeline so the dependency
resolves to a real version range.
