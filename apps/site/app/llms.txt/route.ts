import { SITE_DOCS } from "../docs/_docs";

export const dynamic = "force-static";

const BASE = "https://typecaast.com";

// Machine-readable index for LLMs/agents (https://llmstxt.org convention).
export async function GET(): Promise<Response> {
  const lines = [
    "# Typecaast",
    "",
    "> Simulate & record chat conversations in pixel-faithful renderings of real chat UIs (Slack, iMessage, Telegram, …) from one JSON config. Embed as a React <Typecaast> component or export to video.",
    "",
    "A Typecaast simulation is one JSON config: `meta`, `participants`, optional `pacing`, and a `timeline` of steps. The docs below explain how to author or edit that config by hand — no visual playground needed. Validate with `npx @typecaast/cli validate config.json` or the @typecaast/mcp server's `validate_config` tool.",
    "",
    "## Docs",
    ...SITE_DOCS.map(
      (d) =>
        `- [${d.title}](${BASE}/docs/${d.slug}) — raw markdown: ${BASE}/docs/${d.slug}/raw — ${d.blurb}`,
    ),
    "",
    "## Schema",
    `- [JSON Schema](${BASE}/schema/v1/typecaast.schema.json): the config contract (draft-07). Add \`"$schema": "${BASE}/schema/v1/typecaast.schema.json"\` to a config for editor autocomplete.`,
    "",
    "## Tools",
    "- @typecaast/cli (npm): `npx @typecaast/cli validate config.json`; `typecaast render config.json` for video.",
    "- @typecaast/mcp (npm): an MCP server exposing `validate_config`, `get_json_schema`, `list_skins`, and `scaffold_config` — run it in your own editor/project to assemble and validate configs (e.g. from a screenshot).",
    "- @typecaast/react (npm): the `<Typecaast config={…} />` component.",
    "",
    "## Skins",
    // Keep in sync with registry/skins.json (CI `check:registry`).
    "Set `meta.skin.id` to one of: slack, telegram, claude-code, imessage, messages-macos, whatsapp, cursor, discord.",
    "",
    "## More",
    `- [Playground](${BASE}/playground): build a config visually.`,
    `- [Gallery](${BASE}/gallery): example configs.`,
    `- [Docs index](${BASE}/docs)`,
    `- [llms-full.txt](${BASE}/llms-full.txt): the authoring + pacing guides inlined in one file.`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
