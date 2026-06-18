import type { CSSProperties, FC, ReactNode } from "react";
import type {
  AvatarProps,
  ComposerProps,
  FrameProps,
  MessageProps,
  ReactionProps,
  SystemProps,
  TypingProps,
} from "@typecaast/core";
import {
  fadeSlideIn,
  MessageContent,
  popIn,
  TypingDots,
} from "@typecaast/skin-kit";
import { WHATSAPP_COLORS, WHATSAPP_FONT_STACK } from "./tokens.js";

const RADIUS = 8;

function formatTime(atMs: number): string {
  const base = 9 * 3600 * 1000;
  const total = Math.floor((base + atMs) / 1000);
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const Avatar: FC<AvatarProps> = ({ participant, size = 40 }) => {
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
        background: participant.color ?? "#6a7175",
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

const DoubleTick: FC<{ color: string }> = ({ color }) => (
  <span style={{ color, fontSize: 13, letterSpacing: -3, marginLeft: 3 }}>
    ✓✓
  </span>
);

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = WHATSAPP_COLORS[theme];
  return (
    <span
      style={{
        ...popIn(reaction.progress),
        display: "inline-flex",
        alignItems: "center",
        background: c.reactionBg,
        borderRadius: 12,
        padding: "1px 5px",
        fontSize: 12,
        boxShadow: `0 1px 2px rgba(0,0,0,${theme === "dark" ? 0.4 : 0.18})`,
      }}
    >
      {reaction.emoji}
    </span>
  );
};

const Message: FC<MessageProps> = ({ theme, message }) => {
  const c = WHATSAPP_COLORS[theme];
  const self = message.isSelf;
  const bubble: CSSProperties = {
    position: "relative",
    padding: "6px 8px 5px 9px",
    borderRadius: RADIUS,
    background: self ? c.selfBubble : c.otherBubble,
    color: self ? c.selfText : c.otherText,
    fontSize: 14.2,
    lineHeight: 1.32,
    wordBreak: "break-word",
    boxShadow: `0 1px 0.5px rgba(0,0,0,${theme === "dark" ? 0.2 : 0.13})`,
    ...(self ? { borderTopRightRadius: 0 } : { borderTopLeftRadius: 0 }),
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: self ? "flex-end" : "flex-start",
        padding: message.isGrouped ? "1px 12px" : "3px 12px",
        ...fadeSlideIn(message.revealProgress, { distance: 5 }),
      }}
    >
      {/*
       * `maxWidth` lives on the wrapper (a flex child of the row) so the
       * percentage resolves against the row's definite width. Putting it on
       * the inner bubble made it resolve against the wrapper's auto width,
       * which collapsed to min-content and wrapped short messages.
       */}
      <div style={{ position: "relative", maxWidth: "78%" }}>
        <div style={bubble}>
          <MessageContent
            nodes={message.content}
            imageStyle={{ borderRadius: 6, maxWidth: 240, marginBottom: 2 }}
          />
          <span
            style={{
              float: "right",
              marginLeft: 8,
              marginTop: 2,
              fontSize: 11,
              color: c.bubbleTime,
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(message.atMs)}
            {self ? <DoubleTick color={c.tick} /> : null}
          </span>
        </div>
        {message.reactions.length > 0 ? (
          <div
            style={{
              position: "absolute",
              bottom: -10,
              ...(self ? { right: 8 } : { left: 8 }),
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
  const c = WHATSAPP_COLORS[theme];
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
          borderTopLeftRadius: 0,
          padding: "9px 12px",
          boxShadow: `0 1px 0.5px rgba(0,0,0,${theme === "dark" ? 0.2 : 0.13})`,
        }}
      >
        <TypingDots
          progress={typing.progress}
          color={c.subtle}
          size={7}
          gap={4}
        />
      </div>
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = WHATSAPP_COLORS[theme];
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
        display: "flex",
        justifyContent: "center",
        padding: "6px 0",
        ...fadeSlideIn(message.revealProgress, { distance: 0 }),
      }}
    >
      <span
        style={{
          background: theme === "dark" ? "#182229" : "#ffffff",
          color: c.subtle,
          fontSize: 12.5,
          padding: "5px 12px",
          borderRadius: 8,
          boxShadow: `0 1px 0.5px rgba(0,0,0,0.13)`,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Inline icons (currentColor) — never emoji glyphs, which render inconsistently
// across platforms and aren't real UI chrome.
const EmojiIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    <circle cx="9" cy="9.8" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const MicIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <line x1="12" y1="17" x2="12" y2="20.5" />
    <line x1="8.5" y1="20.5" x2="15.5" y2="20.5" />
  </svg>
);

const SendIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3.4 20.4 21 12 3.4 3.6 3.39 10.1 15 12l-11.61 1.9z" />
  </svg>
);

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = WHATSAPP_COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 10px",
        background: c.composerBar,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 40,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: c.inputBg,
          borderRadius: 22,
          padding: "8px 14px",
          color: c.text,
          fontSize: 15,
        }}
      >
        <span style={{ color: c.subtle, display: "inline-flex" }}>
          <EmojiIcon size={20} />
        </span>
        {hasText ? (
          <span>
            {composer.text}
            <span style={{ color: c.accent }}>|</span>
          </span>
        ) : (
          <span style={{ color: c.placeholder }}>Message</span>
        )}
      </div>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: c.accent,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasText ? <SendIcon size={18} /> : <MicIcon size={20} />}
      </span>
    </div>
  );
};

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = WHATSAPP_COLORS[theme];
  const contact =
    typeof options?.contact === "string" ? options.contact : "WhatsApp";
  const status =
    typeof options?.status === "string" ? options.status : "online";
  return (
    <div
      style={{
        fontFamily: WHATSAPP_FONT_STACK,
        background: c.wallpaper,
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
          gap: 10,
          padding: "8px 12px",
          background: c.header,
          color: c.headerText,
        }}
      >
        <span style={{ fontSize: 22, marginRight: -2 }}>‹</span>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#6a7175",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {initials(contact)}
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}
        >
          <span style={{ fontSize: 16, fontWeight: 600 }}>{contact}</span>
          <span style={{ fontSize: 12, color: c.headerSubtle }}>{status}</span>
        </div>
      </div>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          padding: "6px 0",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const whatsappComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
