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
  popIn,
  TypingDots,
  type ContentStyles,
} from "@typecaast/skin-kit";
import { IMESSAGE_COLORS, IMESSAGE_FONT_STACK } from "./tokens.js";

const RADIUS = 18;
const TAIL = 5;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function markStyles(c: (typeof IMESSAGE_COLORS)[ResolvedTheme]): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "underline" },
    code: {
      fontFamily: "Menlo, monospace",
      fontSize: "0.9em",
    },
  };
}

const StatusBar: FC<{ theme: ResolvedTheme }> = ({ theme }) => {
  const c = IMESSAGE_COLORS[theme];
  return (
    <div
      style={{
        flex: "0 0 auto",
        height: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        color: c.statusText,
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* signal */}
        <span
          style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5 }}
        >
          {[5, 7, 9, 11].map((h, i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: h,
                borderRadius: 1,
                background: c.statusText,
              }}
            />
          ))}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>5G</span>
        {/* battery */}
        <span
          style={{
            display: "inline-block",
            width: 24,
            height: 12,
            borderRadius: 3,
            border: `1px solid ${c.statusText}`,
            position: "relative",
            opacity: 0.9,
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 1.5,
              width: "70%",
              borderRadius: 1,
              background: c.statusText,
            }}
          />
        </span>
      </div>
    </div>
  );
};

const Avatar: FC<AvatarProps> = ({ participant, size = 30 }) => {
  if (participant.avatar) {
    return (
      <img
        src={participant.avatar}
        alt={participant.name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: participant.color ?? "#a9a9af",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.4,
        fontWeight: 500,
      }}
    >
      {initials(participant.name)}
    </div>
  );
};

const NavBar: FC<{
  theme: ResolvedTheme;
  title: string;
  participant?: AvatarProps["participant"];
}> = ({ theme, title, participant }) => {
  const c = IMESSAGE_COLORS[theme];
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "4px 0 8px",
        background: c.navBg,
        borderBottom: `0.5px solid ${c.navBorder}`,
        backdropFilter: "blur(20px)",
      }}
    >
      {participant ? (
        <Avatar theme={theme} participant={participant} size={42} />
      ) : null}
      <span style={{ fontSize: 11, fontWeight: 500, color: c.text }}>
        {title}
        <span style={{ marginLeft: 3, color: c.subtle }}>›</span>
      </span>
    </div>
  );
};

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = IMESSAGE_COLORS[theme];
  return (
    <span
      style={{
        ...popIn(reaction.progress),
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: c.tapbackBg,
        borderRadius: 12,
        padding: "2px 6px",
        fontSize: 12,
        boxShadow: `0 1px 2px ${theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)"}`,
      }}
    >
      {reaction.emoji}
    </span>
  );
};

const Message: FC<MessageProps> = ({ theme, message }) => {
  const c = IMESSAGE_COLORS[theme];
  const self = message.isSelf;
  const bubbleStyle: CSSProperties = {
    maxWidth: "72%",
    padding: "7px 12px",
    borderRadius: RADIUS,
    background: self ? c.selfBubble : c.otherBubble,
    color: self ? c.selfText : c.otherText,
    fontSize: 16,
    lineHeight: 1.3,
    wordBreak: "break-word",
    ...(self
      ? { borderBottomRightRadius: TAIL }
      : { borderBottomLeftRadius: TAIL }),
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: self ? "flex-end" : "flex-start",
        padding: message.isGrouped ? "1px 12px" : "3px 12px",
        ...fadeSlideIn(message.revealProgress, { distance: 6 }),
      }}
    >
      <div style={{ position: "relative" }}>
        <div style={bubbleStyle}>
          <MessageContent
            nodes={message.content}
            styles={markStyles(c)}
            imageStyle={{ borderRadius: 14, maxWidth: 240, marginTop: 2 }}
          />
        </div>
        {message.reactions.length > 0 ? (
          <div
            style={{
              position: "absolute",
              top: -14,
              ...(self ? { left: -6 } : { right: -6 }),
              display: "flex",
              gap: 2,
            }}
          >
            {message.reactions.map((r, i) => (
              <Reaction key={i} theme={theme} reaction={r} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const TypingIndicator: FC<TypingProps> = ({ theme, typing }) => {
  const c = IMESSAGE_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        padding: "3px 12px",
      }}
    >
      <div
        style={{
          background: c.otherBubble,
          borderRadius: RADIUS,
          borderBottomLeftRadius: TAIL,
          padding: "10px 14px",
        }}
      >
        <TypingDots
          progress={typing.progress}
          color={c.subtle}
          size={8}
          gap={5}
        />
      </div>
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = IMESSAGE_COLORS[theme];
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
        textAlign: "center",
        color: c.subtle,
        fontSize: 12,
        fontWeight: 500,
        padding: "8px 0",
        ...fadeSlideIn(message.revealProgress, { distance: 0 }),
      }}
    >
      {text}
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = IMESSAGE_COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 12px",
      }}
    >
      <span
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: theme === "dark" ? "#1c1c1e" : "#e9e9eb",
          color: c.subtle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        +
      </span>
      <div
        style={{
          flex: 1,
          minHeight: 34,
          display: "flex",
          alignItems: "center",
          border: `1px solid ${c.composerBorder}`,
          borderRadius: 18,
          padding: "5px 12px",
          background: c.composerBg,
          color: c.text,
          fontSize: 16,
        }}
      >
        {hasText ? (
          <span>
            {composer.text}
            <span style={{ color: c.selfBubble }}>|</span>
          </span>
        ) : (
          <span style={{ color: c.placeholder }}>iMessage</span>
        )}
      </div>
      {hasText ? (
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: c.selfBubble,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
          }}
        >
          ↑
        </span>
      ) : null}
    </div>
  );
};

const KEY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

const Keyboard: FC<{ theme: ResolvedTheme }> = ({ theme }) => {
  const c = IMESSAGE_COLORS[theme];
  const key = (label: string, wide = false): ReactNode => (
    <span
      key={label}
      style={{
        flex: wide ? 1.6 : 1,
        textAlign: "center",
        padding: "9px 0",
        borderRadius: 5,
        background: label === "⇧" || label === "⌫" ? "transparent" : c.keyBg,
        color: c.keyText,
        fontSize: 16,
        fontWeight: 400,
        boxShadow:
          label === "⇧" || label === "⌫" ? "none" : `0 1px 0 ${c.keyShadow}`,
        textTransform: label.length === 1 ? "uppercase" : "none",
      }}
    >
      {label}
    </span>
  );
  return (
    <div
      style={{
        flex: "0 0 auto",
        background: c.keyboardBg,
        padding: "6px 3px 4px",
        display: "flex",
        flexDirection: "column",
        gap: 7,
      }}
    >
      {KEY_ROWS.map((row, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 5,
            padding: i === 1 ? "0 18px" : "0 3px",
          }}
        >
          {row.map((k) => key(k, k === "⇧" || k === "⌫"))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 5, padding: "0 3px" }}>
        {key("123", true)}
        {key("space", false)}
        {key("return", true)}
      </div>
    </div>
  );
};

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = IMESSAGE_COLORS[theme];
  const contact =
    typeof options?.contact === "string" ? options.contact : "Messages";
  const showKeyboard = options?.keyboard !== false;
  return (
    <div
      style={{
        fontFamily: IMESSAGE_FONT_STACK,
        background: c.bg,
        color: c.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <StatusBar theme={theme} />
      <NavBar theme={theme} title={contact} />
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          paddingBottom: 4,
        }}
      >
        {children}
      </div>
      {showKeyboard ? <Keyboard theme={theme} /> : null}
    </div>
  );
};

export const imessageComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
