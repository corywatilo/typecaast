import type {
  ContentNode,
  ImageNode,
  InlineNode,
  TextNode,
} from "./content-nodes.js";

/**
 * Matches an inline mark: a backtick code span, an http(s) link, or an
 * `@mention`. Everything else becomes plain text runs.
 */
const INLINE_TOKEN = /`([^`]+)`|(https?:\/\/[^\s]+)|(@[A-Za-z0-9_][\w.-]*)/g;

/**
 * Parse a plain authoring string into inline nodes, extracting inline `code`,
 * links, and `@mentions`. Emoji are left inside text runs in v1 (they render
 * fine and a dedicated emoji mark can be authored explicitly).
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
      spans.push({ type: "link", href: match[2] });
    } else if (match[3] !== undefined) {
      spans.push({ type: "mention", label: match[3] });
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
 * Resolve a message's body sugar to content nodes. Explicit `content` is
 * authoritative; otherwise the text node (if any) comes first, then images —
 * matching the "here's the toast: [image]" ordering in the spec example.
 */
export function toContentNodes(body: MessageBodySugar): ContentNode[] {
  if (body.content) return body.content;
  const nodes: ContentNode[] = [];
  if (body.text !== undefined && body.text.length > 0) {
    nodes.push(textToContentNode(body.text));
  }
  if (body.images) {
    for (const image of body.images) nodes.push(imageToContentNode(image));
  }
  return nodes;
}
