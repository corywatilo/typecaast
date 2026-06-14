import { z } from "zod";
import {
  imageNodeSchema,
  textNodeSchema,
  type ContentNode,
} from "./content-nodes.js";

/**
 * The content-type registry. Each message body node has a `type` resolved
 * through here. v1 registers `text` and `image`; additional types can be
 * registered (with their own strict schema) without a schema-version bump.
 *
 * Nodes whose `type` is **not** registered validate leniently (only `type` is
 * required) and are skipped by skins that don't handle them. Nodes whose `type`
 * **is** registered must satisfy that type's schema — so a malformed `text`
 * node is an error rather than silently passing through the lenient path.
 */
const registry = new Map<string, z.ZodTypeAny>([
  ["text", textNodeSchema],
  ["image", imageNodeSchema],
]);

/** Register (or override) the strict schema for a content node type. */
export function registerContentNodeType(
  type: string,
  schema: z.ZodTypeAny,
): void {
  registry.set(type, schema);
}

/** The content node types the runtime validates strictly. */
export function knownContentNodeTypes(): string[] {
  return [...registry.keys()];
}

export function isKnownContentNodeType(type: string): boolean {
  return registry.has(type);
}

/** Accepts any object with a string `type` that isn't a registered type. */
const lenientUnknownNodeSchema = z
  .looseObject({ type: z.string() })
  .refine((node) => !registry.has(node.type), {
    message: "malformed content node for a registered type",
  });

/**
 * Build a content-node schema from the current registry state. Call this after
 * registering a new type to pick it up; `contentNodeSchema` below is the
 * default built from the v1 registry (`text` + `image`).
 */
export function buildContentNodeSchema(): z.ZodType<ContentNode> {
  return z.union([
    ...registry.values(),
    lenientUnknownNodeSchema,
  ]) as unknown as z.ZodType<ContentNode>;
}

/** Default content-node schema (text + image + lenient unknown). */
export const contentNodeSchema = buildContentNodeSchema();

/** A message body: an ordered array of content nodes. */
export const contentSchema = z.array(contentNodeSchema);
