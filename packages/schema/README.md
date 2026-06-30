# @typecaast/schema

The versioned, Zod-validated config schema for [Typecaast](https://typecaast.com)
— the single source of truth for a simulation. Exports `validateConfig`,
`configJsonSchema`, `STEP_TYPES`, and the Zod schemas/types.

Consumers normally never import this directly — `@typecaast/react` and the CLI use
it for you, and you pass plain JSON. Reach for it to validate a config
programmatically:

```ts
import { validateConfig } from "@typecaast/schema";

const diagnostics = validateConfig(myJson); // [] = valid
```

## Authoring configs

- [Authoring configs](https://typecaast.com/docs/authoring-configs) · [Pacing & timing](https://typecaast.com/docs/pacing)
- JSON Schema: <https://typecaast.com/schema/v1/typecaast.schema.json> — add a `$schema` line to a config for editor autocomplete.
- **For LLMs/agents:** <https://typecaast.com/llms.txt> and the [`@typecaast/mcp`](https://www.npmjs.com/package/@typecaast/mcp) server.

Full docs: <https://typecaast.com/docs>. Apache-2.0.
