import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import pkg from "../package.json";
import { DOCS } from "./docs.js";
import { SKINS, jsonSchema, scaffoldConfig, validate } from "./core.js";

/** A tool result that returns a value as pretty-printed JSON text. */
function jsonText(value: unknown): {
  content: { type: "text"; text: string }[];
} {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
  };
}

/** Build the Typecaast MCP server with all tools + doc resources registered. */
export function createServer(): McpServer {
  const server = new McpServer({ name: "typecaast", version: pkg.version });

  server.registerTool(
    "validate_config",
    {
      title: "Validate a Typecaast config",
      description:
        "Validate a Typecaast config (object or JSON string) against the schema and semantic checks. Returns { valid, diagnostics }. Run this after authoring or editing a config (e.g. one drafted from a screenshot).",
      inputSchema: {
        config: z
          .union([z.string(), z.record(z.string(), z.unknown())])
          .describe("The config, as a JSON string or an object."),
      },
    },
    ({ config }) => jsonText(validate(config)),
  );

  server.registerTool(
    "get_json_schema",
    {
      title: "Get the config JSON Schema",
      description:
        'Return the Typecaast config JSON Schema (draft-07). Reference it from a config via a "$schema" line, or use it to build a config skeleton.',
      inputSchema: {},
    },
    () => jsonText(jsonSchema()),
  );

  server.registerTool(
    "list_skins",
    {
      title: "List built-in skins",
      description:
        "List the built-in skins (set one as meta.skin.id), with display name, supported themes, and a one-line summary.",
      inputSchema: {},
    },
    () => jsonText(SKINS),
  );

  server.registerTool(
    "scaffold_config",
    {
      title: "Scaffold a starter config",
      description:
        'Return a minimal valid Typecaast config for the given skin id (default "slack") — a starting point to edit.',
      inputSchema: {
        skinId: z
          .string()
          .optional()
          .describe('Skin id, e.g. "slack" (default), "imessage", "discord".'),
      },
    },
    ({ skinId }) => jsonText(scaffoldConfig(skinId)),
  );

  server.registerTool(
    "get_docs",
    {
      title: "Read an authoring guide",
      description: `Return a Typecaast authoring guide as markdown. Slugs: ${DOCS.map(
        (d) => d.slug,
      ).join(", ")}. Omit "slug" to list them.`,
      inputSchema: {
        slug: z
          .string()
          .optional()
          .describe(
            'Guide slug, e.g. "pacing". Omit to list available guides.',
          ),
      },
    },
    ({ slug }) => {
      if (!slug) {
        return {
          content: [
            {
              type: "text",
              text: DOCS.map((d) => `- ${d.slug}: ${d.title}`).join("\n"),
            },
          ],
        };
      }
      const doc = DOCS.find((d) => d.slug === slug);
      if (!doc) {
        return {
          content: [
            {
              type: "text",
              text: `Unknown guide "${slug}". Available: ${DOCS.map(
                (d) => d.slug,
              ).join(", ")}.`,
            },
          ],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: doc.text }] };
    },
  );

  for (const doc of DOCS) {
    server.registerResource(
      `docs-${doc.slug}`,
      `typecaast://docs/${doc.slug}`,
      {
        title: doc.title,
        description: `Typecaast authoring guide: ${doc.title}`,
        mimeType: "text/markdown",
      },
      (uri) => ({
        contents: [
          { uri: uri.href, mimeType: "text/markdown", text: doc.text },
        ],
      }),
    );
  }

  return server;
}
