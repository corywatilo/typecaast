import { z } from "zod";

/**
 * Inline marks inside a text node. `text` runs carry plain content; the others
 * are the recognized marks (`code`, `link`, `mention`, `emoji`). The set is
 * intentionally small in v1 — new marks can be added without a schema-version
 * bump (unknown content node types are handled leniently; see the registry).
 */
export const inlineTextSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});
export const inlineCodeSchema = z.object({
  type: z.literal("code"),
  value: z.string(),
});
export const inlineLinkSchema = z.object({
  type: z.literal("link"),
  href: z.string(),
  label: z.string().optional(),
});
export const inlineMentionSchema = z.object({
  type: z.literal("mention"),
  /** Display label as authored, e.g. `"@PostHog"`. */
  label: z.string(),
  /** Resolved participant id, filled when the mention binds to a participant. */
  id: z.string().optional(),
});
export const inlineEmojiSchema = z.object({
  type: z.literal("emoji"),
  /** The rendered glyph, e.g. `"🦔"`. */
  value: z.string(),
  /** Optional shortcode, e.g. `"hedgehog"`. */
  shortcode: z.string().optional(),
});

export const inlineNodeSchema = z.discriminatedUnion("type", [
  inlineTextSchema,
  inlineCodeSchema,
  inlineLinkSchema,
  inlineMentionSchema,
  inlineEmojiSchema,
]);
export type InlineNode = z.infer<typeof inlineNodeSchema>;

/** A block of inline content. */
export const textNodeSchema = z.object({
  type: z.literal("text"),
  spans: z.array(inlineNodeSchema),
});
export type TextNode = z.infer<typeof textNodeSchema>;

/** An in-message image (same hosting model as avatars, per `meta.assets`). */
export const imageNodeSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});
export type ImageNode = z.infer<typeof imageNodeSchema>;

/**
 * A content node whose `type` the runtime doesn't recognize. It validates
 * leniently (only `type` is required) and is skipped by skins that don't handle
 * it — so future node types (`attachment`, `linkPreview`, …) slot in without
 * breaking older runtimes or bumping the schema version.
 */
export interface UnknownContentNode {
  type: string;
  [key: string]: unknown;
}

/** The body of a message: an ordered list of content nodes. */
export type ContentNode = TextNode | ImageNode | UnknownContentNode;
