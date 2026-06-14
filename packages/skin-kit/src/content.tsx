import type { CSSProperties, ReactNode } from "react";
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
  emoji?: string;
  image?: string;
}

/** Per-mark inline styles, so skins can theme marks without a CSS file. */
export interface ContentStyles {
  text?: CSSProperties;
  link?: CSSProperties;
  mention?: CSSProperties;
  code?: CSSProperties;
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
}: MessageContentProps): ReactNode {
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
