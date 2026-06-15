import { useState, type FC, type ReactNode } from "react";
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
  type ContentStyles,
} from "@typecaast/skin-kit";
import { TELEGRAM_COLORS, type TelegramColors } from "./tokens.js";
import { TELEGRAM_FONT_STACK } from "./fonts.js";

const AVATAR_SIZE = 34;
const BUBBLE_RADIUS = 12;
const TAIL_RADIUS = 6;

/** Join reactor names ("A", "A and B", "A, B and C") for the reaction tooltip. */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

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

function markStyles(c: TelegramColors): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "none" },
    mention: { color: c.mentionText, fontWeight: 500 },
    code: {
      fontFamily: "Menlo, Monaco, Consolas, monospace",
      fontSize: "0.9em",
    },
  };
}

const Avatar: FC<AvatarProps> = ({
  theme,
  participant,
  size = AVATAR_SIZE,
}) => {
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
          display: "block",
        }}
      />
    );
  }
  void theme;
  return (
    <div
      aria-label={participant.name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: participant.color ?? "#3390ec",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {initials(participant.name)}
    </div>
  );
};

/** A small hover popup naming who reacted (Telegram shows reactor avatars). */
const ReactionTooltip: FC<{ names: string[] }> = ({ names }) => (
  <span
    role="tooltip"
    style={{
      position: "absolute",
      bottom: "calc(100% + 6px)",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      whiteSpace: "nowrap",
      background: "rgba(0,0,0,0.82)",
      color: "#fff",
      borderRadius: 8,
      padding: "5px 9px",
      fontSize: 12,
      boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
      pointerEvents: "none",
    }}
  >
    {joinNames(names)}
  </span>
);

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = TELEGRAM_COLORS[theme];
  const [hover, setHover] = useState(false);
  const hasReactors = reaction.byNames.length > 0;
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        ...popIn(reaction.progress),
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          background: c.reactionBg,
          color: c.reactionText,
          borderRadius: 12,
          padding: "2px 8px",
          height: 22,
          fontSize: 12.5,
          fontWeight: 600,
          cursor: hasReactors ? "pointer" : "default",
        }}
      >
        <span style={{ fontSize: 13 }}>{reaction.emoji}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          {reaction.count}
        </span>
      </span>
      {hover && hasReactors ? (
        <ReactionTooltip names={reaction.byNames} />
      ) : null}
    </span>
  );
};

// Telegram animates three dots in a small incoming bubble while a peer types.
const Dot: FC<{ c: TelegramColors; delay: number }> = ({ c, delay }) => (
  <span
    style={{
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: c.headerSubtle,
      display: "inline-block",
      animation: `tc-tg-typing 1.2s ${delay}ms infinite ease-in-out`,
    }}
  />
);

const TypingIndicator: FC<TypingProps> = ({ theme, author }) => {
  const c = TELEGRAM_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "2px 12px 4px",
      }}
    >
      <div style={{ width: AVATAR_SIZE, flex: "0 0 auto" }}>
        <Avatar theme={theme} participant={author} />
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: c.incomingBg,
          borderRadius: `${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${TAIL_RADIUS}px`,
          padding: "10px 12px",
          boxShadow: c.shadow,
        }}
      >
        <style>
          {
            "@keyframes tc-tg-typing{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-2px)}}"
          }
        </style>
        <Dot c={c} delay={0} />
        <Dot c={c} delay={160} />
        <Dot c={c} delay={320} />
      </div>
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

const PaperPlane: FC<{ color: string }> = ({ color }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={color}
    aria-hidden="true"
  >
    <path d="M2.5 12 21 3.5 17 21l-5.2-4.6L9 20l-.6-5.1L2.5 12Z" />
  </svg>
);

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = TELEGRAM_COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "8px 10px 12px",
        background: c.composerBg,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          border: `1px solid ${c.composerBorder}`,
          borderRadius: 18,
          background: c.composerFieldBg,
          padding: "9px 14px",
          minHeight: 20,
          fontSize: 15,
          color: c.incomingText,
          boxShadow: c.shadow,
        }}
      >
        {hasText ? (
          <span>
            {composer.text}
            <Caret color={c.accent} />
          </span>
        ) : (
          <span style={{ color: c.placeholder }}>Message</span>
        )}
      </div>
      <div
        style={{
          flex: "0 0 auto",
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: hasText ? c.accent : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PaperPlane color={hasText ? c.accentText : c.placeholder} />
      </div>
    </div>
  );
};

/** Bubble meta: time, plus read ticks on outgoing messages. */
const Meta: FC<{ c: TelegramColors; atMs: number; outgoing: boolean }> = ({
  c,
  atMs,
  outgoing,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontSize: 11,
      lineHeight: 1,
      color: outgoing ? c.outgoingMeta : c.incomingMeta,
      float: "right",
      marginLeft: 8,
      marginTop: 6,
      position: "relative",
      top: 4,
    }}
  >
    {formatTime(atMs)}
    {outgoing ? <span style={{ color: c.tick }}>✓✓</span> : null}
  </span>
);

const Message: FC<MessageProps> = ({ theme, message, author }) => {
  const c = TELEGRAM_COLORS[theme];
  const outgoing = message.isSelf;
  const grouped = message.isGrouped;
  const radius = outgoing
    ? `${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${grouped ? BUBBLE_RADIUS : TAIL_RADIUS}px ${BUBBLE_RADIUS}px`
    : `${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${grouped ? BUBBLE_RADIUS : TAIL_RADIUS}px`;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: outgoing ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        padding: grouped ? "1px 12px" : "3px 12px 1px",
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      {/* Incoming keeps a gutter so grouped bubbles align under the avatar. */}
      {outgoing ? null : (
        <div style={{ width: AVATAR_SIZE, flex: "0 0 auto" }}>
          {grouped ? null : <Avatar theme={theme} participant={author} />}
        </div>
      )}
      <div
        style={{ maxWidth: "78%", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            background: outgoing ? c.outgoingBg : c.incomingBg,
            color: outgoing ? c.outgoingText : c.incomingText,
            borderRadius: radius,
            padding: "6px 10px 7px",
            boxShadow: c.shadow,
            wordBreak: "break-word",
            fontSize: 15,
            lineHeight: 1.35,
          }}
        >
          {!outgoing && !grouped ? (
            <div
              style={{
                color: author.color ?? c.nameColor,
                fontWeight: 600,
                fontSize: 13.5,
                marginBottom: 2,
              }}
            >
              {author.name}
            </div>
          ) : null}
          <MessageContent
            nodes={message.content}
            styles={markStyles(c)}
            imageStyle={{ borderRadius: 8, marginTop: 2, maxWidth: 320 }}
          />
          <Meta c={c} atMs={message.atMs} outgoing={outgoing} />
        </div>
        {message.reactions.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: 4,
              marginTop: 4,
              flexWrap: "wrap",
              justifyContent: outgoing ? "flex-end" : "flex-start",
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

/** A bot card: an incoming bubble plus an inline keyboard (Telegram bot UI). */
const SystemMessage: FC<SystemProps> = ({ theme, message, author }) => {
  const c = TELEGRAM_COLORS[theme];
  const actions = message.system?.actions ?? [];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "3px 12px 1px",
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <div style={{ width: AVATAR_SIZE, flex: "0 0 auto" }}>
        {author ? <Avatar theme={theme} participant={author} /> : null}
      </div>
      <div
        style={{ maxWidth: "78%", display: "flex", flexDirection: "column" }}
      >
        <div
          style={{
            background: c.incomingBg,
            color: c.incomingText,
            borderRadius: `${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${BUBBLE_RADIUS}px ${TAIL_RADIUS}px`,
            padding: "6px 10px 7px",
            boxShadow: c.shadow,
            fontSize: 15,
            lineHeight: 1.35,
          }}
        >
          <div
            style={{
              color: author?.color ?? c.nameColor,
              fontWeight: 600,
              fontSize: 13.5,
              marginBottom: 2,
            }}
          >
            {author?.name ?? "Bot"}
          </div>
          <MessageContent nodes={message.content} styles={markStyles(c)} />
          <Meta c={c} atMs={message.atMs} outgoing={false} />
        </div>
        {actions.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              marginTop: 4,
            }}
          >
            {actions.map((a, i) => (
              <div
                key={i}
                style={{
                  background: c.buttonBg,
                  color: c.buttonText,
                  borderRadius: 8,
                  padding: "9px 12px",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "default",
                }}
              >
                {a.label}
              </div>
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
  const c = TELEGRAM_COLORS[theme];
  const title =
    (typeof options?.title === "string" && options.title) ||
    (typeof options?.contact === "string" && options.contact) ||
    "Group chat";
  const status =
    typeof options?.status === "string" && options.status
      ? options.status
      : "online";
  return (
    <div
      style={{
        fontFamily: TELEGRAM_FONT_STACK,
        background: c.bg,
        color: c.incomingText,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        fontSize: 15,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <header
        style={{
          flex: "0 0 auto",
          padding: "9px 14px",
          background: c.headerBg,
          borderBottom: `1px solid ${c.composerBorder}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: c.headerSubtle, fontSize: 22, lineHeight: 1 }}>
          ‹
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: 15,
              color: c.headerText,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 12.5, color: c.headerSubtle }}>{status}</div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: c.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {initials(title)}
        </div>
      </header>
      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          paddingBottom: 6,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const telegramComponents = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
