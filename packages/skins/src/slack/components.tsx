import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type ReactNode,
} from "react";
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
import type {
  ActionsNode,
  AttachmentNode,
  ButtonElement,
  CodeBlockNode,
  ContentNode,
  ContextNode,
  HeaderNode,
  InlineNode,
  SectionNode,
} from "@typecaast/schema";
import {
  fadeSlideIn,
  MessageContent,
  popIn,
  type ContentStyles,
} from "@typecaast/skin-kit";
import { SLACK_COLORS, type SlackColors } from "./tokens.js";
import { SLACK_FONT_STACK } from "./fonts.js";

const AVATAR_RADIUS = 8;

/** Join reactor names the way Slack does ("A", "A and B", "A, B, and C"). */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
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

function markStyles(c: SlackColors): ContentStyles {
  return {
    link: { color: c.link, textDecoration: "none" },
    mention: {
      color: c.mentionText,
      background: c.mentionBg,
      borderRadius: 3,
      padding: "0 2px",
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
    bold: { fontWeight: 700 },
    italic: { fontStyle: "italic" },
    strike: { textDecoration: "line-through" },
  };
}

/** In-message image styling shared by message bodies and image blocks. */
function imageStyle(c: SlackColors): CSSProperties {
  return {
    borderRadius: 8,
    border: `1px solid ${c.border}`,
    maxWidth: 360,
  };
}

/** Vertical gap between blocks within a message (Slack's block rhythm). */
const BLOCK_GAP = 8;

const AppBadge: FC<{ c: SlackColors }> = ({ c }) => (
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
);

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

/** Nearest ancestor that clips overflow — the bound to keep the tooltip inside. */
function clippingAncestor(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;
  while (node) {
    const o = getComputedStyle(node).overflow;
    if (o && o !== "visible") return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Slack's custom hover tooltip: big emoji over "<names> reacted with :code:",
 * with a tail pointing at the reaction. Centered, but **clamped** to stay
 * inside the sim viewport (like Slack clamps to the window) — the tail tracks
 * the reaction so it still points correctly after a shift.
 */
const ReactionTooltip: FC<{
  reaction: ReactionProps["reaction"];
}> = ({ reaction }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [dx, setDx] = useState(0);
  const code = reaction.shortcode;

  // Slack's reaction tooltip is a **dark popover in both light and dark mode** —
  // it doesn't follow the color theme. Match that for fidelity: a near-black
  // surface (Slack's own `#1d1c1d`) with light text. A hairline border + shadow
  // separate it from the column, which matters most in dark mode where the
  // surface sits close to the column background.
  const surface = "#1d1c1d";
  const border = "rgba(255,255,255,0.08)";
  const fg = "#f8f8f8";
  const muted = "#ababad";

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const bound = clippingAncestor(el)?.getBoundingClientRect();
    if (!bound) return;
    const rect = el.getBoundingClientRect();
    const m = 8;
    let shift = 0;
    if (rect.left < bound.left + m) shift = bound.left + m - rect.left;
    else if (rect.right > bound.right - m) shift = bound.right - m - rect.right;
    setDx(shift);
  }, []);

  return (
    <span
      ref={ref}
      role="tooltip"
      style={{
        position: "absolute",
        bottom: "calc(100% + 9px)",
        left: "50%",
        transform: `translateX(calc(-50% + ${dx}px))`,
        zIndex: 20,
        width: 220,
        boxSizing: "border-box",
        background: surface,
        color: fg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "13px 14px 12px",
        textAlign: "center",
        fontSize: 13,
        lineHeight: 1.4,
        boxShadow: "0 6px 20px rgba(0,0,0,0.45)",
        pointerEvents: "none",
      }}
    >
      <span style={{ display: "block", fontSize: 30, marginBottom: 6 }}>
        {reaction.emoji}
      </span>
      <span style={{ fontWeight: 700 }}>{joinNames(reaction.byNames)}</span>
      <span style={{ color: muted }}> reacted with </span>
      <span style={{ color: muted }}>
        {code ? `:${code}:` : reaction.emoji}
      </span>
      {/* downward tail — offset opposite the clamp shift so it stays on the chip */}
      <span
        style={{
          position: "absolute",
          top: "100%",
          left: `calc(50% - ${dx}px)`,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: `7px solid ${surface}`,
        }}
      />
    </span>
  );
};

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = SLACK_COLORS[theme];
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
          gap: 4,
          background: c.reactionBg,
          border: `1px solid ${c.reactionBorder}`,
          color: c.reactionText,
          borderRadius: 12,
          padding: "1px 7px",
          height: 22,
          fontSize: 12,
          cursor: hasReactors ? "pointer" : "default",
        }}
      >
        <span style={{ fontSize: 13 }}>{reaction.emoji}</span>
        <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {reaction.count}
        </span>
      </span>
      {hover && hasReactors ? <ReactionTooltip reaction={reaction} /> : null}
    </span>
  );
};

// Slack shows a plain "<name> is typing…" line under the reply box — no bouncing
// dots (those are an iMessage/WhatsApp idiom, not Slack's). Left edge lines up
// with the composer; small, muted, upright text.
const TypingIndicator: FC<TypingProps> = ({ theme, author }) => {
  const c = SLACK_COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 16px 5px",
        color: c.subtle,
        fontSize: 11.5,
      }}
    >
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
    // No top padding, plus a negative top margin, so the reply box butts up
    // against the last message. The thread keeps its 16px in-scroll
    // padding-bottom (which protects the newest message from the
    // `column-reverse` scroll-edge clip), so this only closes the *visual* gap —
    // the margin eats empty padding, never message content.
    <div style={{ flex: "0 0 auto", padding: "0 16px 14px", marginTop: -8 }}>
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

function buttonStyle(
  c: SlackColors,
  style: ButtonElement["style"],
  linked: boolean,
): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 4,
    padding: "7px 12px",
    fontWeight: 700,
    fontSize: 13,
    // Linked actions feel clickable; un-linked actions advertise that they
    // aren't via the standard "no-entry" cursor so authors and viewers can
    // tell at a glance the button is decorative.
    cursor: linked ? "pointer" : "not-allowed",
    fontFamily: "inherit",
    lineHeight: 1,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    // Keep each button's label on one line; the row wraps buttons instead.
    whiteSpace: "nowrap",
  };
  if (style === "primary") {
    return {
      ...base,
      background: c.primary,
      color: c.primaryText,
      border: "none",
    };
  }
  if (style === "danger") {
    // Slack's danger style is an outlined red button (fills on hover in the
    // real client; we keep it inert/outlined).
    return {
      ...base,
      background: "transparent",
      color: c.danger,
      border: `1px solid ${c.danger}`,
    };
  }
  return {
    ...base,
    background: "transparent",
    color: c.buttonText,
    border: `1px solid ${c.buttonBorder}`,
  };
}

/** A wrapping row of Block Kit buttons (an `actions` block or a card footer). */
const SlackButtons: FC<{
  c: SlackColors;
  buttons: ButtonElement[];
  marginTop?: number;
}> = ({ c, buttons, marginTop = 8 }) => {
  if (buttons.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop }}>
      {buttons.map((b, i) => {
        const style = buttonStyle(c, b.style, !!b.href);
        return b.href ? (
          <a
            key={i}
            href={b.href}
            target="_blank"
            rel="noreferrer noopener"
            style={style}
          >
            {b.label}
          </a>
        ) : (
          <button
            key={i}
            type="button"
            aria-disabled
            style={style}
            onClick={(e) => e.preventDefault()}
          >
            {b.label}
          </button>
        );
      })}
    </div>
  );
};

/** Render a span list through the shared content renderer, Slack-themed. */
function Spans({
  c,
  spans,
}: {
  c: SlackColors;
  spans: InlineNode[];
}): ReactNode {
  return (
    <MessageContent nodes={[{ type: "text", spans }]} styles={markStyles(c)} />
  );
}

/**
 * Render one Block Kit content node, Slack-styled. Top-level blocks render
 * full-width (no border); the colored left bar is an `attachment` block only.
 * Unknown nodes are skipped.
 */
const Block: FC<{ theme: ResolvedTheme; node: ContentNode }> = ({
  theme,
  node,
}) => {
  const c = SLACK_COLORS[theme];
  switch (node.type) {
    case "text":
      return (
        <div style={{ color: c.text, wordBreak: "break-word" }}>
          <MessageContent
            nodes={[node]}
            styles={markStyles(c)}
            imageStyle={imageStyle(c)}
          />
        </div>
      );
    case "image":
      return (
        <MessageContent
          nodes={[node]}
          styles={markStyles(c)}
          imageStyle={imageStyle(c)}
        />
      );
    case "header":
      return (
        <div
          style={{
            fontWeight: 700,
            fontSize: 18,
            lineHeight: 1.3,
            color: c.text,
          }}
        >
          {(node as HeaderNode).text}
        </div>
      );
    case "section": {
      const s = node as SectionNode;
      const body = (
        <div
          style={{
            flex: 1,
            minWidth: 0,
            color: c.text,
            wordBreak: "break-word",
          }}
        >
          <Spans c={c} spans={s.spans ?? []} />
          {s.fields && s.fields.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px 16px",
                marginTop: 6,
              }}
            >
              {s.fields.map((f, i) => (
                <div key={i} style={{ fontSize: 13.5 }}>
                  <Spans c={c} spans={f.spans ?? []} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
      if (!s.accessory) return body;
      const accessory =
        s.accessory.type === "button" ? (
          <SlackButtons c={c} buttons={[s.accessory]} marginTop={0} />
        ) : (
          <img
            src={s.accessory.src}
            alt={s.accessory.alt ?? ""}
            style={{
              width: 88,
              height: 88,
              borderRadius: 8,
              objectFit: "cover",
              display: "block",
            }}
          />
        );
      return (
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          {body}
          <div style={{ flex: "0 0 auto" }}>{accessory}</div>
        </div>
      );
    }
    case "context":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            color: c.subtle,
            fontSize: 13.5,
            lineHeight: 1.4,
          }}
        >
          {(node as ContextNode).elements.map((el, i) =>
            el.type === "image" ? (
              <img
                key={i}
                src={el.src}
                alt={el.alt ?? ""}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <span key={i} style={{ color: c.subtle }}>
                <Spans c={c} spans={el.spans ?? []} />
              </span>
            ),
          )}
        </div>
      );
    case "divider":
      return <div style={{ height: 1, background: c.border }} />;
    case "actions":
      return (
        <SlackButtons
          c={c}
          buttons={(node as ActionsNode).elements}
          marginTop={0}
        />
      );
    case "codeblock":
      // Slack's fenced ``` block: a monospaced box that preserves whitespace
      // and newlines verbatim (no inline parsing). Body color (not the pink
      // inline-code color) on a subtle grey fill, like the real client.
      return (
        <pre
          style={{
            margin: 0,
            background: c.codeBg,
            border: `1px solid ${c.codeBorder}`,
            borderRadius: 8,
            padding: "8px 12px",
            color: c.text,
            fontFamily: "Menlo, Monaco, Consolas, monospace",
            fontSize: 12.5,
            lineHeight: 1.5,
            whiteSpace: "pre",
            overflowX: "auto",
            tabSize: 4,
          }}
        >
          {(node as CodeBlockNode).text}
        </pre>
      );
    case "attachment": {
      const a = node as AttachmentNode;
      return (
        <div
          style={{
            borderLeft: `4px solid ${a.color ?? c.cardBar}`,
            borderRadius: 2,
            paddingLeft: 12,
            display: "flex",
            flexDirection: "column",
            gap: BLOCK_GAP,
          }}
        >
          {a.content.map((n, i) => (
            <Block key={i} theme={theme} node={n} />
          ))}
        </div>
      );
    }
    default:
      return null; // unknown node type — skipped
  }
};

/** Render a message body as a sequence of Block Kit blocks (uniform gap). */
const Blocks: FC<{ theme: ResolvedTheme; nodes: ContentNode[] }> = ({
  theme,
  nodes,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: BLOCK_GAP,
      marginTop: 2,
    }}
  >
    {nodes.map((node, i) => (
      <Block key={i} theme={theme} node={node} />
    ))}
  </div>
);

// A system/notice line ("X joined #channel", a date marker, etc.) — a small
// muted line indented to align with the message text column. App "cards" are
// NOT system messages: they're app-sender messages carrying Block Kit content.
const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = SLACK_COLORS[theme];
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        // 60px = avatar (36) + gap (8) + row padding (16), so the notice lines
        // up under the message text column.
        padding: "4px 16px 4px 60px",
        background: hover ? c.hoverBg : "transparent",
        color: c.subtle,
        fontSize: 13,
        lineHeight: 1.4,
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <MessageContent nodes={message.content} styles={markStyles(c)} />
    </div>
  );
};

const Message: FC<MessageProps> = ({ theme, message, author }) => {
  const c = SLACK_COLORS[theme];
  const grouped = message.isGrouped;
  const [hover, setHover] = useState(false);
  // Slack reveals a small gutter timestamp (no AM/PM) when hovering a grouped
  // message — un-grouped ones already show the time next to the name.
  const gutterTime = formatTime(message.atMs).replace(/\s[AP]M$/, "");
  return (
    // Outer carries the inter-message gap as margin so the hover background (on
    // the inner row) stays snug around the message and never fills the gap.
    <div style={{ marginTop: grouped ? 8 : 10 }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          gap: 8,
          padding: "4px 16px 2px",
          background: hover ? c.hoverBg : "transparent",
          ...fadeSlideIn(message.revealProgress),
        }}
      >
        <div style={{ flex: "0 0 36px", width: 36 }}>
          {grouped ? (
            hover ? (
              <span
                style={{
                  display: "block",
                  textAlign: "right",
                  paddingTop: 3,
                  paddingRight: 4,
                  fontSize: 10.5,
                  lineHeight: 1.5,
                  color: c.subtle,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {gutterTime}
              </span>
            ) : null
          ) : (
            <Avatar theme={theme} participant={author} size={36} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {grouped ? null : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontWeight: 700, color: c.text }}>
                {author.name}
              </span>
              {author.kind === "app" ? <AppBadge c={c} /> : null}
              <span style={{ fontSize: 12, color: c.subtle, marginLeft: 2 }}>
                {formatTime(message.atMs)}
              </span>
            </div>
          )}
          <Blocks theme={theme} nodes={message.content} />
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
          // Breathing room so the last message/card never touches the bottom edge.
          paddingBottom: 12,
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
