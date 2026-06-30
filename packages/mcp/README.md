# @typecaast/mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server for authoring
and validating [Typecaast](https://typecaast.com) configs **from your own
editor/project** — no need to open the playground.

It's the loop-closer for assembling a config by hand (or from a screenshot): your
assistant drafts the JSON guided by the schema + authoring guides this server
exposes, then calls `validate_config` to catch mistakes and fix them.

Rendering to video is **not** part of this server (it needs a headless browser) —
use [`@typecaast/cli`](https://www.npmjs.com/package/@typecaast/cli) for that.

## Tools

| Tool              | What it does                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `validate_config` | Validate a config (object or JSON string) → `{ valid, diagnostics }`.       |
| `get_json_schema` | The config JSON Schema (draft-07).                                          |
| `list_skins`      | Built-in skins for `meta.skin.id` (id, name, themes, summary).              |
| `scaffold_config` | A minimal valid starter config for a given skin id.                         |
| `get_docs`        | Read an authoring guide (`authoring-configs`, `pacing`, `message-content`). |

The authoring guides are also exposed as MCP **resources** (`typecaast://docs/*`)
for clients that surface them.

## Use it with Claude Code

```bash
claude mcp add typecaast -- npx -y @typecaast/mcp
```

## Use it with Claude Desktop (or any MCP client)

Add to your client's MCP config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "typecaast": {
      "command": "npx",
      "args": ["-y", "@typecaast/mcp"]
    }
  }
}
```

The server speaks MCP over stdio. The binary is `typecaast-mcp` if you prefer to
install it globally (`npm i -g @typecaast/mcp`).

## Typical flow

1. Give your assistant a screenshot (or describe the conversation).
2. It calls `list_skins` / `get_docs` to learn the format, drafts the JSON config.
3. It calls `validate_config`; if there are `E_*` errors, it fixes them and re-validates.
4. Drop the config into [`<Typecaast>`](https://www.npmjs.com/package/@typecaast/react)
   or render it with `npx @typecaast/cli render config.json`.

## License

Apache-2.0. Part of the [Typecaast](https://github.com/corywatilo/typecaast) monorepo.
