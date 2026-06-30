import { z } from "zod";

/**
 * Inline marks inside a text node. `text` runs carry plain content; the others
 * are the recognized marks (`code`, `link`, `mention`, `emoji`, and the
 * emphasis marks `bold`/`italic`/`strike`). New marks can be added without a
 * schema-version bump (unknown content node types are handled leniently; see
 * the registry). Emphasis marks are flat (no nesting, e.g. bold *and* italic on
 * the same run) — a deliberate v1 simplification matching Slack's common usage.
 */
export const inlineTextSchema = z.object({
  type: z.literal("text"),
  value: z.string(),
});
export const inlineCodeSchema = z.object({
  type: z.literal("code"),
  value: z.string(),
});
export const inlineBoldSchema = z.object({
  type: z.literal("bold"),
  value: z.string(),
});
export const inlineItalicSchema = z.object({
  type: z.literal("italic"),
  value: z.string(),
});
export const inlineStrikeSchema = z.object({
  type: z.literal("strike"),
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
  inlineBoldSchema,
  inlineItalicSchema,
  inlineStrikeSchema,
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

// --- Block Kit content nodes -------------------------------------------------
// Slack apps compose rich messages from "blocks". These model the common set
// (header / section / context / divider / actions / image / attachment) so an
// app message is a normal message from an `app` participant whose `content`
// carries blocks — the same primitives a real Slack app would emit. Skins that
// don't understand a block skip it (lenient registry), so they're Slack-leaning
// but safe everywhere.

/**
 * An interactive button (in an `actions` block or as a `section` accessory).
 * With `href` the skin renders a link opening in a new tab; without one it's
 * visibly inert. `style` controls emphasis — omitted = default (outlined),
 * matching Slack's `primary`/`danger`/default button styles.
 */
export const buttonElementSchema = z.object({
  type: z.literal("button"),
  label: z.string(),
  href: z.string().optional(),
  style: z.enum(["primary", "danger"]).optional(),
});
export type ButtonElement = z.infer<typeof buttonElementSchema>;

/** A small image element (a `context` element or a `section` accessory). */
export const imageElementSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().optional(),
});
export type ImageElement = z.infer<typeof imageElementSchema>;

/** A large bold heading (Block Kit `header` — plain text, no inline marks). */
export const headerNodeSchema = z.object({
  type: z.literal("header"),
  text: z.string(),
});
export type HeaderNode = z.infer<typeof headerNodeSchema>;

/**
 * A section block: a paragraph of inline content, with an optional `accessory`
 * (a button or image to its right) and optional `fields` (a two-column grid).
 * Text may be authored as `spans` (resolved) or `text` (sugar, parsed to spans
 * by `toContentNodes`).
 */
export const sectionFieldSchema = z.object({
  spans: z.array(inlineNodeSchema).optional(),
  text: z.string().optional(),
});
export const sectionNodeSchema = z.object({
  type: z.literal("section"),
  spans: z.array(inlineNodeSchema).optional(),
  text: z.string().optional(),
  accessory: z
    .discriminatedUnion("type", [buttonElementSchema, imageElementSchema])
    .optional(),
  fields: z.array(sectionFieldSchema).optional(),
});
export type SectionNode = z.infer<typeof sectionNodeSchema>;

/** A context block: a row of small, muted text/image elements. */
export const contextTextElementSchema = z.object({
  type: z.literal("text"),
  spans: z.array(inlineNodeSchema).optional(),
  text: z.string().optional(),
});
export const contextElementSchema = z.discriminatedUnion("type", [
  contextTextElementSchema,
  imageElementSchema,
]);
export type ContextElement = z.infer<typeof contextElementSchema>;
export const contextNodeSchema = z.object({
  type: z.literal("context"),
  elements: z.array(contextElementSchema),
});
export type ContextNode = z.infer<typeof contextNodeSchema>;

/** A horizontal rule between blocks. */
export const dividerNodeSchema = z.object({
  type: z.literal("divider"),
});
export type DividerNode = z.infer<typeof dividerNodeSchema>;

/** A row of interactive buttons. */
export const actionsNodeSchema = z.object({
  type: z.literal("actions"),
  elements: z.array(buttonElementSchema),
});
export type ActionsNode = z.infer<typeof actionsNodeSchema>;

/**
 * A multi-line preformatted code block (Slack's fenced ``` block) — a monospaced
 * box that preserves whitespace and newlines verbatim (used for tables, logs,
 * snippets). Distinct from the inline `code` mark; `text` is **literal** and is
 * never parsed for inline marks. `lang` is an optional language hint (unused by
 * the current skins, reserved for future syntax highlighting).
 */
export const codeBlockNodeSchema = z.object({
  type: z.literal("codeblock"),
  text: z.string(),
  lang: z.string().optional(),
});
export type CodeBlockNode = z.infer<typeof codeBlockNodeSchema>;

/**
 * A legacy-style attachment: nested blocks rendered behind a colored left bar.
 * `color` is any CSS color (defaults to a neutral bar). Recursive — its Zod
 * schema lives in `content-registry.ts` (where the node union is built).
 */
export interface AttachmentNode {
  type: "attachment";
  color?: string;
  content: ContentNode[];
}

/**
 * A content node whose `type` the runtime doesn't recognize. It validates
 * leniently (only `type` is required) and is skipped by skins that don't handle
 * it — so future node types (`linkPreview`, `videoEmbed`, …) slot in without
 * breaking older runtimes or bumping the schema version.
 */
export interface UnknownContentNode {
  type: string;
  [key: string]: unknown;
}

/** The body of a message: an ordered list of content nodes. */
export type ContentNode =
  | TextNode
  | ImageNode
  | HeaderNode
  | SectionNode
  | ContextNode
  | DividerNode
  | ActionsNode
  | CodeBlockNode
  | AttachmentNode
  | UnknownContentNode;
