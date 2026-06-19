import type { CSSProperties, FC, ReactNode } from "react";
import type {
  AvatarProps,
  ComposerProps,
  FrameProps,
  MessageProps,
  ReactionProps,
  ResolvedTheme,
  SystemProps,
  TypingProps,
} from "@typecaast/core";
import {
  fadeSlideIn,
  MessageContent,
  TypingDots,
  type ContentStyles,
} from "@typecaast/skin-kit";
import { CURSOR_COLORS, CURSOR_FONT_STACK } from "./tokens.js";

function markStyles(c: (typeof CURSOR_COLORS)[ResolvedTheme]): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "none" },
    code: {
      fontFamily: "Menlo, Monaco, monospace",
      fontSize: "0.86em",
      background: c.codeBg,
      color: c.codeText,
      // Cursor outlines its code snippets — match that with a hairline border.
      border: `1px solid ${c.border}`,
      borderRadius: 4,
      padding: "1px 4px",
      overflowWrap: "anywhere",
    },
  };
}

const Avatar: FC<AvatarProps> = () => null;
const Reaction: FC<ReactionProps> = () => null;

const Message: FC<MessageProps> = ({ theme, message }) => {
  const c = CURSOR_COLORS[theme];
  const self = message.isSelf;
  if (self) {
    return (
      <div
        style={{ padding: "5px 12px", ...fadeSlideIn(message.revealProgress) }}
      >
        <div
          style={{
            background: c.userBg,
            border: `1px solid ${c.userBorder}`,
            borderRadius: 8,
            padding: "8px 11px",
            color: c.text,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <MessageContent nodes={message.content} styles={markStyles(c)} />
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "5px 12px 9px",
        color: c.text,
        fontSize: 13,
        lineHeight: 1.6,
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <MessageContent nodes={message.content} styles={markStyles(c)} />
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = CURSOR_COLORS[theme];
  const text = message.content
    .map((n) =>
      n.type === "text"
        ? (n as { spans: { value?: string }[] }).spans
            .map((s) => s.value ?? "")
            .join("")
        : "",
    )
    .join(" ");
  return (
    <div
      style={{
        margin: "4px 12px",
        padding: "6px 10px",
        border: `1px solid ${c.border}`,
        borderLeft: `2px solid ${c.accent}`,
        background: c.userBg,
        borderRadius: 4,
        color: c.dim,
        fontSize: 12,
        fontFamily: "Menlo, monospace",
        overflowWrap: "anywhere",
        ...fadeSlideIn(message.revealProgress, { distance: 0 }),
      }}
    >
      {text}
    </div>
  );
};

const TypingIndicator: FC<TypingProps> = ({ theme, typing }) => {
  const c = CURSOR_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        color: c.dim,
        fontSize: 12.5,
      }}
    >
      <TypingDots progress={typing.progress} color={c.accent} size={5} />
      Generating…
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ theme, composer, options }) => {
  const c = CURSOR_COLORS[theme];
  const hasText = composer.text.length > 0;
  const model =
    typeof options?.model === "string" && options.model.trim()
      ? options.model
      : "Mythos";
  const chip: CSSProperties = {
    fontSize: 11,
    color: c.dim,
    background: c.chipBg,
    borderRadius: 5,
    padding: "2px 7px",
  };
  return (
    <div style={{ flex: "0 0 auto", padding: "0 12px 12px" }}>
      <div
        style={{
          border: `1px solid ${c.composerBorder}`,
          borderRadius: 10,
          background: c.composerBg,
          padding: "9px 11px",
          color: c.text,
          fontSize: 13,
        }}
      >
        <div style={{ minHeight: 18 }}>
          {hasText ? (
            <span>
              {composer.text}
              <span style={{ color: c.accent }}>▍</span>
            </span>
          ) : (
            <span style={{ color: c.placeholder }}>
              Plan, search, build anything
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 9,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span style={chip}>∞ Agent</span>
            <span style={chip}>{model}</span>
          </div>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: hasText ? c.accent : c.chipBg,
              color: hasText ? "#fff" : c.dim,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            ↑
          </span>
        </div>
      </div>
    </div>
  );
};

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = CURSOR_COLORS[theme];
  const title = typeof options?.title === "string" ? options.title : "Chat";
  return (
    <div
      style={{
        fontFamily: CURSOR_FONT_STACK,
        background: c.bg,
        color: c.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${c.border}`,
          fontSize: 12,
          color: c.dim,
        }}
      >
        <span style={{ fontWeight: 600, color: c.text }}>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: 14 }}>＋</span>
        <span style={{ fontSize: 14 }}>⋯</span>
      </div>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          padding: "6px 0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const cursorComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
