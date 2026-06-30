// Pure, dependency-light helpers — no MCP SDK, no .md imports — so they're
// trivially unit-testable. The SDK wiring lives in server.ts.
import {
  validateConfig,
  configJsonSchema,
  type Diagnostic,
} from "@typecaast/schema";
import skinsRegistry from "../../../registry/skins.json";

export const SCHEMA_ID =
  "https://typecaast.com/schema/v1/typecaast.schema.json";

export interface SkinInfo {
  id: string;
  name: string;
  themes: string[];
  summary: string;
}

/**
 * Slim built-in skin manifest derived from registry/skins.json — no React, so
 * the server stays Node-pure. (Capabilities aren't included to avoid importing
 * the skin components; `themes` + `summary` are enough to pick one.)
 */
export const SKINS: SkinInfo[] = skinsRegistry.skins
  .filter((s) => s.official)
  .map((s) => ({
    id: s.id,
    name: s.name,
    themes: s.themes,
    summary: s.summary,
  }));

/** The JSON Schema, wrapped with the same $id/title as the site + artifact. */
export function jsonSchema(): Record<string, unknown> {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: SCHEMA_ID,
    title: "Typecaast config",
    ...configJsonSchema(),
  };
}

export interface ValidationResult {
  valid: boolean;
  diagnostics: Diagnostic[];
  /** Set when the input wasn't valid JSON (couldn't even be parsed). */
  error?: string;
}

/** Validate a config given as an object or a JSON string. */
export function validate(config: unknown): ValidationResult {
  let value = config;
  if (typeof config === "string") {
    try {
      value = JSON.parse(config);
    } catch (e) {
      return {
        valid: false,
        diagnostics: [],
        error: `Invalid JSON: ${(e as Error).message}`,
      };
    }
  }
  const diagnostics = validateConfig(value);
  const valid = !diagnostics.some((d) => d.severity === "error");
  return { valid, diagnostics };
}

/** A minimal valid config to start from, for the given skin (default slack). */
export function scaffoldConfig(skinId = "slack"): Record<string, unknown> {
  return {
    $schema: SCHEMA_ID,
    version: 1,
    meta: { canvas: { width: 600, height: 760 }, skin: { id: skinId } },
    participants: [
      { id: "me", name: "You", isSelf: true },
      { id: "sam", name: "Sam" },
    ],
    timeline: [
      { type: "message", from: "sam", text: "ship it?" },
      { type: "delay", duration: 1500 },
      { type: "message", from: "me", text: "shipping 🚀" },
    ],
  };
}
