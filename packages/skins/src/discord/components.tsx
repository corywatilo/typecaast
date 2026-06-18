import type { FC, ReactNode } from "react";
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
  type ContentStyles,
} from "@typecaast/skin-kit";
import {
  DISCORD_COLORS,
  DISCORD_FONT_STACK,
  type DiscordColors,
} from "./tokens.js";

const GUTTER = 56; // avatar column width + padding

function formatTime(atMs: number): string {
  const base = 9 * 3600 * 1000;
  const total = Math.floor((base + atMs) / 1000);
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `Today at ${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function markStyles(c: DiscordColors): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "none" },
    mention: {
      color: c.mentionText,
      background: c.mentionBg,
      borderRadius: 3,
      padding: "0 2px",
      fontWeight: 500,
    },
    code: {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "0.85em",
      background: c.codeBg,
      color: c.codeText,
      borderRadius: 3,
      padding: "1px 4px",
    },
  };
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
        background: participant.color ?? "#5865f2",
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

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = DISCORD_COLORS[theme];
  return (
    <span
      style={{
        ...popIn(reaction.progress),
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: c.reactionBg,
        border: `1px solid ${c.reactionBorder}`,
        borderRadius: 8,
        padding: "2px 7px",
        fontSize: 13,
        color: c.reactionText,
      }}
    >
      <span>{reaction.emoji}</span>
      <span style={{ fontWeight: 600, fontSize: 12 }}>{reaction.count}</span>
    </span>
  );
};

const Message: FC<MessageProps> = ({ theme, message, author }) => {
  const c = DISCORD_COLORS[theme];
  const roleColor = author.color ?? c.username;
  const body = (
    <div style={{ color: c.text, fontSize: 15, lineHeight: 1.375 }}>
      <MessageContent
        nodes={message.content}
        styles={markStyles(c)}
        imageStyle={{ borderRadius: 8, marginTop: 4, maxWidth: 320 }}
      />
      {message.reactions.length > 0 ? (
        <div
          style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}
        >
          {message.reactions.map((r, i) => (
            <Reaction key={i} theme={theme} reaction={r} />
          ))}
        </div>
      ) : null}
    </div>
  );

  if (message.isGrouped) {
    return (
      <div
        style={{
          padding: `1px 16px 1px ${GUTTER}px`,
          ...fadeSlideIn(message.revealProgress, { distance: 4 }),
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        padding: "8px 16px 2px",
        ...fadeSlideIn(message.revealProgress, { distance: 4 }),
      }}
    >
      <Avatar theme={theme} participant={author} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ color: roleColor, fontWeight: 500, fontSize: 15 }}>
            {author.name}
          </span>
          <span style={{ color: c.timestamp, fontSize: 12 }}>
            {formatTime(message.atMs)}
          </span>
        </div>
        {body}
      </div>
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = DISCORD_COLORS[theme];
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
        gap: 16,
        alignItems: "center",
        padding: "4px 16px 4px 24px",
        color: c.muted,
        fontSize: 14,
        ...fadeSlideIn(message.revealProgress, { distance: 0 }),
      }}
    >
      <span style={{ color: "#3ba55c" }}>＋</span>
      {text}
    </div>
  );
};

const TypingIndicator: FC<TypingProps> = ({ theme, typing, author }) => {
  const c = DISCORD_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "2px 16px 4px",
        color: c.text,
        fontSize: 13,
      }}
    >
      <TypingDots progress={typing.progress} color={c.muted} size={5} />
      <span>
        <strong>{author.name}</strong> is typing…
      </span>
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = DISCORD_COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div style={{ flex: "0 0 auto", padding: "0 16px 18px" }}>
      <div
        style={{
          background: c.composerBg,
          borderRadius: 8,
          padding: "11px 14px",
          color: c.text,
          fontSize: 15,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: c.muted, fontSize: 20 }}>＋</span>
        {hasText ? (
          <span>
            {composer.text}
            <span style={{ color: c.text }}>|</span>
          </span>
        ) : (
          <span style={{ color: c.placeholder }}>Message #general</span>
        )}
      </div>
    </div>
  );
};

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = DISCORD_COLORS[theme];
  const channel =
    typeof options?.channel === "string" ? options.channel : "general";
  return (
    <div
      style={{
        fontFamily: DISCORD_FONT_STACK,
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
          padding: "12px 16px",
          borderBottom: `1px solid ${c.channelBarBorder}`,
          boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
        }}
      >
        <span style={{ color: c.hashtag, fontSize: 22, fontWeight: 600 }}>
          #
        </span>
        <span style={{ fontWeight: 600, fontSize: 16, color: c.username }}>
          {channel}
        </span>
      </div>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          paddingBottom: 6,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const discordComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
