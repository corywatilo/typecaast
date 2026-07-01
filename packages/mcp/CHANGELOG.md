# @typecaast/mcp

## 0.1.1

### Patch Changes

- 8bf80bd: Fix the broken `0.1.0`, which shipped an unresolved `"@typecaast/schema":
"workspace:*"` dependency and failed to install (`EUNSUPPORTEDPROTOCOL`). The
  first publish was done manually with `npm publish`, which — unlike `pnpm
publish` and the automated release — doesn't rewrite pnpm's `workspace:`
  protocol. Republished through the normal pnpm/OIDC pipeline so the dependency
  resolves to a real version range.

## 0.1.0

### Minor Changes

- b9e02ff: Add `@typecaast/mcp` — a Model Context Protocol server for authoring and
  validating Typecaast configs from your own editor/project (no playground needed).

  Run it over stdio (`npx @typecaast/mcp`). Tools: `validate_config`,
  `get_json_schema`, `list_skins`, `scaffold_config`, and `get_docs`; the authoring
  guides are also exposed as `typecaast://docs/*` resources. It's the loop-closer
  for assembling a config by hand (or from a screenshot): draft the JSON guided by
  the schema + guides, then `validate_config` to catch and fix mistakes. Depends
  only on `@typecaast/schema` (no React, no render deps) — Node-pure.

### Patch Changes

- Updated dependencies [b9e02ff]
  - @typecaast/schema@0.4.1
