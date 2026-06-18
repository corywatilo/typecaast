import type { CSSProperties, FC, ReactNode } from "react";
import type { ContentNode } from "@typecaast/schema";
import type {
  AvatarProps,
  ComposerProps,
  FrameProps,
  MessageProps,
  ReactionProps,
  SystemProps,
  TypingProps,
} from "@typecaast/core";
import { TUI_COLORS, MONO_STACK } from "./tokens.js";

/** Flatten content to a plain string (terminals render text, not rich marks). */
function flatten(content: ContentNode[]): string {
  return content
    .map((node) => {
      if (node.type === "text") {
        const spans = (node as { spans: Array<Record<string, unknown>> }).spans;
        return spans
          .map((s) =>
            typeof s.value === "string"
              ? s.value
              : typeof s.label === "string"
                ? s.label
                : typeof s.href === "string"
                  ? s.href
                  : "",
          )
          .join("");
      }
      if (node.type === "image") {
        const alt = (node as { alt?: string }).alt;
        return `[image${alt ? `: ${alt}` : ""}]`;
      }
      return "";
    })
    .join(" ");
}

/** Reveal text by progress to mimic streaming output. */
function streamed(text: string, progress: number): string {
  if (progress >= 1) return text;
  return text.slice(0, Math.round(progress * text.length));
}

const lineStyle: CSSProperties = {
  padding: "2px 0",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

const Avatar: FC<AvatarProps> = () => null;

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => (
  <span style={{ color: TUI_COLORS[theme].dim }}> {reaction.emoji}</span>
);

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const TypingIndicator: FC<TypingProps> = ({ theme, typing }) => {
  const c = TUI_COLORS[theme];
  const frame =
    Math.floor(typing.progress * SPINNER.length * 6) % SPINNER.length;
  return (
    <div style={{ ...lineStyle, color: c.dim }}>
      <span style={{ color: c.spinner }}>{SPINNER[frame]}</span> Thinking…
    </div>
  );
};

const Message: FC<MessageProps> = ({ theme, message }) => {
  const c = TUI_COLORS[theme];
  const text = streamed(flatten(message.content), message.revealProgress);
  if (message.isSelf) {
    return (
      <div style={{ ...lineStyle, display: "flex", gap: 8 }}>
        <span style={{ color: c.prompt }}>❯</span>
        <span style={{ color: c.text }}>{text}</span>
      </div>
    );
  }
  return (
    <div style={{ ...lineStyle, display: "flex", gap: 8 }}>
      <span style={{ color: c.accent }}>⏺</span>
      <span style={{ color: c.text }}>{text}</span>
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = TUI_COLORS[theme];
  const text = streamed(flatten(message.content), message.revealProgress);
  return (
    <div style={{ ...lineStyle, display: "flex", gap: 8, color: c.dim }}>
      <span style={{ color: c.system }}>⎿</span>
      <span>{text}</span>
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = TUI_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "6px 0 2px",
        marginTop: 6,
        borderTop: `1px solid ${c.border}`,
      }}
    >
      <span style={{ color: c.prompt }}>❯</span>
      <span style={{ whiteSpace: "pre-wrap", color: c.text }}>
        {composer.text}
        <span style={{ color: c.cursor }}>█</span>
      </span>
    </div>
  );
};

const Dot: FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      width: 11,
      height: 11,
      borderRadius: "50%",
      background: color,
      display: "inline-block",
    }}
  />
);

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = TUI_COLORS[theme];
  const title =
    typeof options?.title === "string" ? options.title : "claude — typecaast";
  return (
    <div
      style={{
        fontFamily: MONO_STACK,
        background: c.bg,
        color: c.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        fontSize: 13,
        lineHeight: 1.5,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          height: 30,
          background: c.titleBar,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <Dot color={c.dotRed} />
        <Dot color={c.dotYellow} />
        <Dot color={c.dotGreen} />
        <span style={{ marginLeft: 6, color: c.dim, fontSize: 12 }}>
          {title}
        </span>
      </div>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "10px 14px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const tuiComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
