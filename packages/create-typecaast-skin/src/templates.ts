/**
 * Skin scaffold templates. Each returns the contents of one file. Generated
 * code uses string concatenation (not template literals) so these templates
 * stay free of `${}` interpolation; `__NAME__`/`__ID__`/`__VAR__` placeholders
 * are substituted by `render`.
 */

export interface SkinNames {
  /** kebab-case id, e.g. "my-skin". */
  id: string;
  /** Display name, e.g. "My Skin". */
  name: string;
  /** camelCase export var, e.g. "mySkin". */
  varName: string;
}

export function toNames(input: string): SkinNames {
  const id = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const words = id.split("-").filter(Boolean);
  const name = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const varName =
    (words[0] ?? "skin") +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
  return { id, name, varName };
}

function render(template: string, n: SkinNames): string {
  return template
    .replaceAll("__ID__", n.id)
    .replaceAll("__NAME__", n.name)
    .replaceAll("__VAR__", n.varName);
}

const TOKENS = `import type { ResolvedTheme } from "@typecaast/core";
import type { SkinTokens } from "@typecaast/skin-kit";

export interface Colors {
  bg: string;
  text: string;
  subtle: string;
  selfBubble: string;
  selfText: string;
  otherBubble: string;
  otherText: string;
  border: string;
  composerBg: string;
  accent: string;
}

export const COLORS: Record<ResolvedTheme, Colors> = {
  light: {
    bg: "#ffffff",
    text: "#111111",
    subtle: "#6b6b6b",
    selfBubble: "#2563eb",
    selfText: "#ffffff",
    otherBubble: "#f0f0f0",
    otherText: "#111111",
    border: "#e6e6e6",
    composerBg: "#f7f7f7",
    accent: "#2563eb",
  },
  dark: {
    bg: "#1a1a1a",
    text: "#e8e8e8",
    subtle: "#9a9a9a",
    selfBubble: "#2563eb",
    selfText: "#ffffff",
    otherBubble: "#2a2a2a",
    otherText: "#e8e8e8",
    border: "#333333",
    composerBg: "#222222",
    accent: "#5b8bff",
  },
};

export const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const tokens: { light: SkinTokens; dark: SkinTokens } = {
  light: { colors: COLORS.light as unknown as Record<string, string> },
  dark: { colors: COLORS.dark as unknown as Record<string, string> },
};
`;

const CAPABILITIES = `import type { Capabilities } from "@typecaast/skin-kit";

export const capabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native",
    reaction: "native",
    system: "native",
    edit: "native",
    delete: "native",
    readReceipt: "unsupported",
    beat: "native",
  },
  content: { text: true, image: true },
  reactions: true,
  threads: false,
  readReceipts: false,
};
`;

const COMPONENTS = `import type { FC, ReactNode } from "react";
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
import { COLORS, FONT_STACK } from "./tokens.js";

const Avatar: FC<AvatarProps> = ({ participant, size = 32 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: participant.color ?? "#9aa",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.4,
    }}
  >
    {participant.name.charAt(0).toUpperCase()}
  </div>
);

const Reaction: FC<ReactionProps> = ({ theme, reaction }) => {
  const c = COLORS[theme];
  return (
    <span
      style={{
        ...popIn(reaction.progress),
        display: "inline-flex",
        gap: 4,
        background: c.otherBubble,
        borderRadius: 10,
        padding: "1px 7px",
        fontSize: 12,
        color: c.text,
      }}
    >
      {reaction.emoji} {reaction.count}
    </span>
  );
};

const Message: FC<MessageProps> = ({ theme, message }) => {
  const c = COLORS[theme];
  const self = message.isSelf;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: self ? "flex-end" : "flex-start",
        padding: "3px 12px",
        ...fadeSlideIn(message.revealProgress),
      }}
    >
      <div style={{ maxWidth: "75%" }}>
        <div
          style={{
            background: self ? c.selfBubble : c.otherBubble,
            color: self ? c.selfText : c.otherText,
            borderRadius: 14,
            padding: "7px 11px",
            fontSize: 15,
            lineHeight: 1.35,
          }}
        >
          <MessageContent nodes={message.content} />
        </div>
        {message.reactions.length > 0 ? (
          <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
            {message.reactions.map((r, i) => (
              <Reaction key={i} theme={theme} reaction={r} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const SystemMessage: FC<SystemProps> = ({ theme, message }) => {
  const c = COLORS[theme];
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
        padding: "6px 0",
        ...fadeSlideIn(message.revealProgress, { distance: 0 }),
      }}
    >
      {text}
    </div>
  );
};

const TypingIndicator: FC<TypingProps> = ({ theme, typing, author }) => {
  const c = COLORS[theme];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 12px",
        color: c.subtle,
        fontSize: 12,
      }}
    >
      <TypingDots progress={typing.progress} color={c.subtle} />
      {author.name} is typing…
    </div>
  );
};

const Composer: FC<ComposerProps> = ({ theme, composer }) => {
  const c = COLORS[theme];
  const hasText = composer.text.length > 0;
  return (
    <div style={{ flex: "0 0 auto", padding: "8px 12px 12px" }}>
      <div
        style={{
          border: "1px solid " + c.border,
          borderRadius: 18,
          background: c.composerBg,
          padding: "8px 12px",
          color: c.text,
          fontSize: 15,
        }}
      >
        {hasText ? (
          <span>
            {composer.text}
            <span style={{ color: c.accent }}>|</span>
          </span>
        ) : (
          <span style={{ color: c.subtle }}>Message…</span>
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
  const c = COLORS[theme];
  const title = typeof options?.title === "string" ? options.title : "__NAME__";
  return (
    <div
      style={{
        fontFamily: FONT_STACK,
        background: c.bg,
        color: c.text,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          padding: "10px 14px",
          borderBottom: "1px solid " + c.border,
          fontWeight: 600,
        }}
      >
        {title}
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

export const components = {
  Frame,
  Message,
  TypingIndicator,
  Reaction,
  Composer,
  SystemMessage,
  Avatar,
};
`;

const INDEX = `import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { components } from "./components.js";
import { capabilities } from "./capabilities.js";
import { tokens } from "./tokens.js";

const optionsSchema = z.object({
  /** Title shown in the header. */
  title: z.string().optional(),
});

/** A __NAME__-style skin. Built from create-typecaast-skin — now make it yours. */
export const __VAR__ = defineSkin({
  id: "__ID__",
  meta: {
    name: "__NAME__",
    defaultCanvas: { width: 480, height: 720 },
    supportsThemes: ["light", "dark"],
    capabilities,
    optionsSchema,
    // fonts: [...]  // declare web fonts here (PLAN §19)
  },
  components,
  tokens,
});
`;

const README = `# __NAME__ skin

Scaffolded with \`create-typecaast-skin\`. See the
[Build a skin](https://github.com/corywatilo/typecaast/blob/master/docs/authoring-skins.md)
guide.

\`\`\`tsx
import { Typecaast } from "@typecaast/react";
import { __VAR__ } from "./__ID__/index.js";

<Typecaast config={config} skin={__VAR__} autoplay loop />;
\`\`\`

## Make it yours

1. **tokens.ts** — set the real light/dark colors.
2. **components.tsx** — match the target UI's layout, spacing, and type.
3. **capabilities.ts** — declare what the skin supports (drop what it can't render).
4. Declare \`fonts\` in \`index.ts\` so text matches the platform.
5. Add Storybook stories + visual-regression baselines (pixel-perfect bar).
6. Name it \`"<Platform>-style"\`; don't bundle proprietary marks/fonts.
`;

/** All files for a scaffolded skin, keyed by relative path. */
export function skinFiles(input: string): Record<string, string> {
  const n = toNames(input);
  return {
    "index.ts": render(INDEX, n),
    "components.tsx": render(COMPONENTS, n),
    "tokens.ts": render(TOKENS, n),
    "capabilities.ts": render(CAPABILITIES, n),
    "README.md": render(README, n),
  };
}
