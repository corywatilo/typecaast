import type { CSSProperties, ReactElement, ReactNode } from "react";
import type {
  ContentNode,
  ImageNode,
  InlineNode,
  TextNode,
} from "@typecaast/schema";

export interface ContentClassNames {
  text?: string;
  link?: string;
  mention?: string;
  code?: string;
  bold?: string;
  italic?: string;
  strike?: string;
  emoji?: string;
  image?: string;
}

/** Per-mark inline styles, so skins can theme marks without a CSS file. */
export interface ContentStyles {
  text?: CSSProperties;
  link?: CSSProperties;
  mention?: CSSProperties;
  code?: CSSProperties;
  bold?: CSSProperties;
  italic?: CSSProperties;
  strike?: CSSProperties;
  emoji?: CSSProperties;
}

export interface MessageContentProps {
  nodes: ContentNode[];
  /** Per-mark class names so skins style marks with their own CSS. */
  classNames?: ContentClassNames;
  /** Per-mark inline styles (merged with the defaults). */
  styles?: ContentStyles;
  /** Extra style for in-message images (skins set radius, max size, etc.). */
  imageStyle?: CSSProperties;
}

function renderInline(
  span: InlineNode,
  key: number,
  cn: ContentClassNames,
  st: ContentStyles,
): ReactNode {
  switch (span.type) {
    case "text":
      return span.value;
    case "code":
      return (
        <code key={key} data-tc-mark="code" className={cn.code} style={st.code}>
          {span.value}
        </code>
      );
    case "bold":
      return (
        <strong
          key={key}
          data-tc-mark="bold"
          className={cn.bold}
          style={st.bold}
        >
          {span.value}
        </strong>
      );
    case "italic":
      return (
        <em
          key={key}
          data-tc-mark="italic"
          className={cn.italic}
          style={st.italic}
        >
          {span.value}
        </em>
      );
    case "strike":
      return (
        <s
          key={key}
          data-tc-mark="strike"
          className={cn.strike}
          style={st.strike}
        >
          {span.value}
        </s>
      );
    case "link":
      return (
        <a
          key={key}
          data-tc-mark="link"
          className={cn.link}
          style={st.link}
          href={span.href}
          rel="noreferrer"
        >
          {span.label ?? span.href}
        </a>
      );
    case "mention":
      return (
        <span
          key={key}
          data-tc-mark="mention"
          className={cn.mention}
          style={st.mention}
        >
          {span.label}
        </span>
      );
    case "emoji":
      return (
        <span
          key={key}
          data-tc-mark="emoji"
          className={cn.emoji}
          style={st.emoji}
        >
          {span.value}
        </span>
      );
  }
}

function renderImage(
  node: ImageNode,
  key: number,
  cn: ContentClassNames,
  imageStyle?: CSSProperties,
): ReactNode {
  return (
    <img
      key={key}
      data-tc-node="image"
      className={cn.image}
      src={node.src}
      alt={node.alt ?? ""}
      width={node.width}
      height={node.height}
      style={{ maxWidth: "100%", display: "block", ...imageStyle }}
    />
  );
}

/**
 * Render a message body (`ContentNode[]`) to React: text nodes with inline
 * marks (code/link/mention/emoji) and in-message images. Unknown node types are
 * skipped (forward-compatible — PLAN §6). SSR-safe, so it renders identically
 * in the browser and in Remotion's Node renderer. Skins style via `classNames`.
 */
export function MessageContent({
  nodes,
  classNames = {},
  styles = {},
  imageStyle,
}: MessageContentProps): ReactElement {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === "text") {
          const text = node as TextNode;
          return (
            <span
              key={i}
              data-tc-node="text"
              className={classNames.text}
              style={styles.text}
            >
              {text.spans.map((span, j) =>
                renderInline(span, j, classNames, styles),
              )}
            </span>
          );
        }
        if (node.type === "image") {
          return renderImage(node as ImageNode, i, classNames, imageStyle);
        }
        return null; // unknown future node type — skipped
      })}
    </>
  );
}

/**
 * Render composer (reply-box) text with completed `@mentions` shown as tags —
 * mirroring how a chat UI commits a mention once you type past the name. A
 * still-being-typed trailing `@name` (no following space yet) stays plain text;
 * other mrkdwn (`*bold*`, `` `code` ``) is left literal, the way composers show
 * raw markup while you type. Pass the skin's own mention `style`/`className` so
 * the in-composer tag matches that platform's sent-message mentions; a skin with
 * no mention style gets plain (untagged) text, which is correct for it.
 */
export function renderComposerMentions(
  text: string,
  style?: CSSProperties,
  className?: string,
): ReactNode[] {
  // A trailing "@word" at the very end (no following space) is still being
  // typed — keep it plain until a space commits it to a tag.
  const trailing = /@[A-Za-z0-9_][\w.-]*$/.exec(text);
  const splitIdx =
    trailing !== null &&
    (trailing.index === 0 || /\s/.test(text[trailing.index - 1] ?? ""))
      ? trailing.index
      : text.length;
  const head = text.slice(0, splitIdx);
  const tail = text.slice(splitIdx);

  const out: ReactNode[] = [];
  const re = /(^|\s)(@[A-Za-z0-9_][\w.-]*)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(head)) !== null) {
    const lead = m[1] ?? "";
    const name = m[2] ?? "";
    const at = m.index + lead.length; // index of the '@'
    if (at > last) out.push(head.slice(last, at));
    out.push(
      <span
        key={`m${key++}`}
        data-tc-mark="mention"
        className={className}
        style={style}
      >
        {name}
      </span>,
    );
    last = at + name.length;
  }
  if (last < head.length) out.push(head.slice(last));
  if (tail) out.push(tail);
  return out;
}
