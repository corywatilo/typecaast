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
  type ContentStyles,
} from "@typecaast/skin-kit";
import { SLACK_COLORS, type SlackColors } from "./tokens.js";
import { SLACK_FONT_STACK } from "./fonts.js";

const AVATAR_RADIUS = 8;

/** Fabricate a stable wall-clock time from a timeline offset (sim starts 9:00am). */
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

function markStyles(c: SlackColors): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "none" },
    mention: {
      color: c.mentionText,
      background: c.mentionBg,
      borderRadius: 3,
      padding: "0 2px",
      fontWeight: 600,
    },
    code: {
      color: c.codeText,
      background: c.codeBg,
      border: `1px solid ${c.codeBorder}`,
      borderRadius: 3,
      padding: "1px 4px",
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      fontSize: "0.85em",
    },
  };
}

const Avatar: FC<AvatarProps> = ({ theme, participant, size = 36 }) => {
  const c = SLACK_COLORS[theme];
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
          borderRadius: AVATAR_RADIUS,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }
  return (
    <div
      aria-label={participant.name}
      style={{
        width: size,
        height: size,
        borderRadius: AVATAR_RADIUS,
        background: participant.color ?? "#4a154b",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.4,
        border: theme === "dark" ? `1px solid ${c.border}` : undefined,
      }}
    >
      {initials(participant.name)}
    </div>
  );
};

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = SLACK_COLORS[theme];
  return (
    <span
      style={{
        ...popIn(reaction.progress),
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: c.reactionBg,
        border: `1px solid ${c.reactionBorder}`,
        color: c.reactionText,
        borderRadius: 12,
        padding: "1px 7px",
        height: 22,
        fontSize: 12,
      }}
    >
      <span style={{ fontSize: 13 }}>{reaction.emoji}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
        {reaction.count}
      </span>
    </span>
  );
};

const TypingIndicator: FC<TypingProps> = ({ theme, typing, author }) => {
  const c = SLACK_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 16px 4px 60px",
        color: c.subtle,
        fontSize: 12,
      }}
    >
      <TypingDots progress={typing.progress} color={c.subtle} size={5} />
      <span>{author.name} is typing…</span>
    </div>
  );
};

const Caret: FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      display: "inline-block",
      width: 1.5,
      height: "1.05em",
      background: color,
      marginLeft: 1,
      verticalAlign: "text-bottom",
    }}
  />
);

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = SLACK_COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div style={{ flex: "0 0 auto", padding: "4px 16px 14px" }}>
      <div
        style={{
          border: `1px solid ${c.composerBorder}`,
          borderRadius: 8,
          background: c.composerBg,
          padding: "9px 12px",
          minHeight: 22,
          fontSize: 15,
          color: c.text,
        }}
      >
        {hasText ? (
          <span>
            {composer.text}
            <Caret color={c.caret} />
          </span>
        ) : (
          <span style={{ color: c.placeholder }}>Reply…</span>
        )}
      </div>
    </div>
  );
};

function buttonStyle(c: SlackColors, primary: boolean): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 4,
    padding: "7px 12px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "default",
    fontFamily: "inherit",
    lineHeight: 1,
  };
  return primary
    ? { ...base, background: c.primary, color: c.primaryText, border: "none" }
    : {
        ...base,
        background: "transparent",
        color: c.buttonText,
        border: `1px solid ${c.buttonBorder}`,
      };
}

const SystemMessage: FC<SystemProps> = ({ theme, message, author }) => {
  const c = SLACK_COLORS[theme];
  const actions = message.system?.actions ?? [];
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: "8px 16px 2px",
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <div style={{ flex: "0 0 36px", width: 36 }}>
        {author ? (
          <Avatar theme={theme} participant={author} size={36} />
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 700, color: c.text }}>
            {author?.name ?? "App"}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.4,
              background: c.appBadgeBg,
              color: c.appBadgeText,
              borderRadius: 2,
              padding: "1px 4px",
            }}
          >
            APP
          </span>
          <span style={{ fontSize: 12, color: c.subtle }}>
            {formatTime(message.atMs)}
          </span>
        </div>
        <div
          style={{
            marginTop: 4,
            borderLeft: `4px solid ${c.cardBar}`,
            borderRadius: 2,
            paddingLeft: 12,
          }}
        >
          <div style={{ color: c.text }}>
            <MessageContent nodes={message.content} styles={markStyles(c)} />
          </div>
          {actions.length > 0 ? (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {actions.map((a, i) => (
                <button key={i} type="button" style={buttonStyle(c, i === 0)}>
                  {a.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const Message: FC<MessageProps> = ({ theme, message, author }) => {
  const c = SLACK_COLORS[theme];
  const grouped = message.isGrouped;
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        padding: grouped ? "2px 16px" : "8px 16px 2px",
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <div style={{ flex: "0 0 36px", width: 36 }}>
        {grouped ? null : (
          <Avatar theme={theme} participant={author} size={36} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {grouped ? null : (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontWeight: 700, color: c.text }}>
              {author.name}
            </span>
            <span style={{ fontSize: 12, color: c.subtle }}>
              {formatTime(message.atMs)}
            </span>
          </div>
        )}
        <div style={{ color: c.text, wordBreak: "break-word" }}>
          <MessageContent
            nodes={message.content}
            styles={markStyles(c)}
            imageStyle={{
              borderRadius: 8,
              marginTop: 4,
              border: `1px solid ${c.border}`,
              maxWidth: 360,
            }}
          />
        </div>
        {message.reactions.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 4,
              flexWrap: "wrap",
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

const Frame: FC<FrameProps & { children?: ReactNode }> = ({
  theme,
  options,
  children,
}) => {
  const c = SLACK_COLORS[theme];
  const channel =
    typeof options?.channel === "string" ? options.channel : "#general";
  return (
    <div
      style={{
        fontFamily: SLACK_FONT_STACK,
        background: c.bg,
        color: c.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        fontSize: 15,
        lineHeight: 1.46668,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header
        style={{
          flex: "0 0 auto",
          padding: "10px 16px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 900, fontSize: 18, color: c.text }}>
          Thread
        </span>
        <span style={{ color: c.subtle, fontSize: 13 }}>{channel}</span>
      </header>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const slackComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
