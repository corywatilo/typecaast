import type {
  AttachmentNode,
  ContentNode,
  ContextNode,
  ImageNode,
  InlineNode,
  SectionNode,
  TextNode,
} from "./content-nodes.js";

/**
 * Matches an inline mark, in priority order: a backtick code span, Slack mrkdwn
 * emphasis (`*bold*`, `_italic_`, `~strike~`), an http(s) link, a `<@id>`
 * mention (Slack's encoded form — resolved to a display name at compile), or a
 * bare `@name` mention. Everything else becomes plain text runs.
 *
 * Emphasis delimiters must hug their content (no leading/trailing space), and
 * `_italic_` requires non-alphanumeric boundaries so `snake_case` and URLs with
 * underscores are left alone.
 */
const INLINE_TOKEN =
  /`([^`]+)`|\*(?!\s)([^*\n]+?)(?<!\s)\*|(?<![A-Za-z0-9])_(?!\s)([^_\n]+?)(?<!\s)_(?![A-Za-z0-9])|~(?!\s)([^~\n]+?)(?<!\s)~|(https?:\/\/[^\s]+)|<@([A-Za-z0-9_.-]+)>|(@[A-Za-z0-9_][\w.-]*)/g;

/**
 * Parse a plain authoring string into inline nodes, extracting inline `code`,
 * `bold`/`italic`/`strike`, links, and mentions. Emoji are left inside text
 * runs (they render fine; a dedicated emoji mark can be authored explicitly).
 * A `<@id>` mention carries its `id` and a placeholder label; the engine
 * resolves the label to the participant's display name at compile time.
 */
export function parseInline(text: string): InlineNode[] {
  if (text.length === 0) return [];
  const spans: InlineNode[] = [];
  const re = new RegExp(INLINE_TOKEN.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const matchText = match[0] ?? "";
    if (match.index > lastIndex) {
      spans.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      spans.push({ type: "code", value: match[1] });
    } else if (match[2] !== undefined) {
      spans.push({ type: "bold", value: match[2] });
    } else if (match[3] !== undefined) {
      spans.push({ type: "italic", value: match[3] });
    } else if (match[4] !== undefined) {
      spans.push({ type: "strike", value: match[4] });
    } else if (match[5] !== undefined) {
      spans.push({ type: "link", href: match[5] });
    } else if (match[6] !== undefined) {
      spans.push({ type: "mention", id: match[6], label: `@${match[6]}` });
    } else if (match[7] !== undefined) {
      spans.push({ type: "mention", label: match[7] });
    }
    lastIndex = match.index + matchText.length;
  }
  if (lastIndex < text.length) {
    spans.push({ type: "text", value: text.slice(lastIndex) });
  }
  return spans;
}

/** Convenience shape for authoring an in-message image. */
export interface ImageSugar {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** `text` string → a single text content node. */
export function textToContentNode(text: string): TextNode {
  return { type: "text", spans: parseInline(text) };
}

/** `image` sugar → an image content node (drops undefined optionals). */
export function imageToContentNode(image: ImageSugar): ImageNode {
  const node: ImageNode = { type: "image", src: image.src };
  if (image.alt !== undefined) node.alt = image.alt;
  if (image.width !== undefined) node.width = image.width;
  if (image.height !== undefined) node.height = image.height;
  return node;
}

/** The sugar fields a message may carry instead of explicit `content`. */
export interface MessageBodySugar {
  /** Authored text (parsed into inline marks). */
  text?: string;
  /** In-message images, rendered after the text. */
  images?: ImageSugar[];
  /** Explicit content nodes; when present, wins over `text`/`images`. */
  content?: ContentNode[];
}

/**
 * Resolve a block's `text` sugar to `spans` (and recurse into attachments), so
 * skins only ever read resolved inline content. Non-text blocks pass through.
 */
export function normalizeContentNode(node: ContentNode): ContentNode {
  // Explicit casts: `ContentNode` includes the lenient `UnknownContentNode`
  // (index signature), so a plain `switch` widens the narrowed fields to
  // `unknown`. The runtime `type` check is authoritative.
  if (node.type === "section") {
    const s = node as SectionNode;
    return {
      type: "section",
      spans: s.spans ?? parseInline(s.text ?? ""),
      ...(s.accessory ? { accessory: s.accessory } : {}),
      ...(s.fields
        ? {
            fields: s.fields.map((f) => ({
              spans: f.spans ?? parseInline(f.text ?? ""),
            })),
          }
        : {}),
    };
  }
  if (node.type === "context") {
    const c = node as ContextNode;
    return {
      type: "context",
      elements: c.elements.map((el) =>
        el.type === "text"
          ? { type: "text", spans: el.spans ?? parseInline(el.text ?? "") }
          : el,
      ),
    };
  }
  if (node.type === "attachment") {
    const a = node as AttachmentNode;
    return {
      type: "attachment",
      ...(a.color ? { color: a.color } : {}),
      content: a.content.map(normalizeContentNode),
    };
  }
  return node;
}

/**
 * Resolve a message's body sugar to content nodes. Explicit `content` is
 * authoritative (block `text` sugar is normalized to spans); otherwise the text
 * node (if any) comes first, then images — matching the "here's the toast:
 * [image]" ordering in the spec example.
 */
export function toContentNodes(body: MessageBodySugar): ContentNode[] {
  if (body.content) return body.content.map(normalizeContentNode);
  const nodes: ContentNode[] = [];
  if (body.text !== undefined && body.text.length > 0) {
    nodes.push(textToContentNode(body.text));
  }
  if (body.images) {
    for (const image of body.images) nodes.push(imageToContentNode(image));
  }
  return nodes;
}
