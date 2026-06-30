# @typecaast/react

The React renderer for [Typecaast](https://typecaast.com) — drop a `<Typecaast>`
component on a page and play back a scripted chat conversation from one JSON
config, in a pixel-faithful skin (Slack, iMessage, WhatsApp, Discord, …).

```bash
npm install @typecaast/react react
```

```tsx
import { Typecaast } from "@typecaast/react";
import config from "./conversation.json";

export default () => <Typecaast config={config} autoplay loop />;
```

The skin loads lazily from `config.meta.skin.id`, and you pass only the
serializable config — so this works in a React Server Component (Next.js App
Router) with no `"use client"`.

## Authoring configs

A config is plain JSON — write or edit it by hand (or have an LLM do it), no
playground required:

- [Authoring configs](https://typecaast.com/docs/authoring-configs) — every field and timeline step type.
- [Pacing & timing](https://typecaast.com/docs/pacing) — gaps, delays, and how to get ~1–2s between messages.
- JSON Schema: <https://typecaast.com/schema/v1/typecaast.schema.json> — add a `$schema` line for editor autocomplete.
- **For LLMs/agents:** the index at <https://typecaast.com/llms.txt>, and the [`@typecaast/mcp`](https://www.npmjs.com/package/@typecaast/mcp) server to assemble and validate configs from your own project.

Full docs: <https://typecaast.com/docs>. Apache-2.0.
