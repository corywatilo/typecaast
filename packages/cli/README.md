# @typecaast/cli

Command line for [Typecaast](https://typecaast.com): validate and render config
files.

```bash
npx @typecaast/cli validate config.json
npx @typecaast/cli render config.json --aspect 9:16 --scale 2 --theme dark
```

- `validate <config>` — schema + semantic checks (exit `0` = OK; `--json` for machine-readable diagnostics).
- `render <config>` — MP4 / GIF / WebM via Remotion (`--format`, `--size`, `--aspect`, `--scale`, `--theme`, `--transparent`).
- `scaffold-skin <draft>` — turn a capture draft into a skin package.

## Authoring configs

A config is plain JSON — write or edit it by hand, no playground required:

- [Authoring configs](https://typecaast.com/docs/authoring-configs) · [Pacing & timing](https://typecaast.com/docs/pacing) · [Message content](https://typecaast.com/docs/message-content)
- JSON Schema: <https://typecaast.com/schema/v1/typecaast.schema.json>
- **For LLMs/agents:** <https://typecaast.com/llms.txt> and the [`@typecaast/mcp`](https://www.npmjs.com/package/@typecaast/mcp) server (validate configs from your own editor).

Full docs: <https://typecaast.com/docs>. Apache-2.0.
