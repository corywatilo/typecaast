# Build a skin

A **skin** is what makes a Typecaast simulation _look_ like a specific UI — Slack,
iMessage, a terminal, your own app. The engine produces a `SimState` (who's
visible, typing progress, the composer text, …); a skin is the set of React
components that render that state in a platform's exact visual language.

This guide takes you from zero to a working, theme-aware skin. The contract is
small — seven components plus metadata — and the same skin renders in both the
live React player and the Remotion video export.

> **Heads-up on trademarks.** Reproduce _layout, type, spacing, and color_ —
> not logos or proprietary fonts. Name skins `"<Platform>-style"`. See
> [`TRADEMARKS.md`](../TRADEMARKS.md). Community skins are untrusted code and are
> sandboxed; the registry is a directory, not an endorsement.

## Install

```bash
pnpm add @typecaast/skin-kit @typecaast/core react
```

`@typecaast/skin-kit` gives you `defineSkin`, the types, the theme context, the
font loader, the animation primitives, and `MessageContent`. The component
_prop_ types live in `@typecaast/core`.

## The contract

```ts
import { defineSkin } from "@typecaast/skin-kit";

export const mySkin = defineSkin({
  id: "my-skin", // matches meta.skin.id in a config
  meta: {
    name: "My Skin",
    defaultCanvas: { width: 480, height: 720 },
    supportsThemes: ["light", "dark"], // or just ["dark"] for a single-mode UI
    capabilities: myCapabilities, // see below
    optionsSchema, // optional Zod schema for meta.skin.options
    fonts, // optional declared web fonts
  },
  components: {
    Frame, // chrome: header/window; wraps the thread + composer
    Message, // a message row/bubble
    SystemMessage, // app/system cards
    TypingIndicator, // "X is typing…" / dots / spinner
    Reaction, // a single reaction pill/badge
    Composer, // the input area (typed text + caret)
    Avatar, // an avatar (image or initials)
  },
  tokens, // optional { light, dark } design tokens
});
```

Skins must be **pure and SSR-safe** — no `window`-only access at module top
level — because the same code runs in the browser and in Remotion's Node
renderer.

### The components

Every component receives the resolved `theme` (`"light" | "dark"`). Prop types
come from `@typecaast/core`:

| Component         | Key props                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| `Frame`           | `theme`, `options` (your `meta.skin.options`), `children` (thread + composer) |
| `Message`         | `theme`, `message: RenderedMessage`, `author: Participant`, `previousAuthor?` |
| `SystemMessage`   | `theme`, `message` (with `message.system` = `{ card?, actions? }`), `author?` |
| `TypingIndicator` | `theme`, `typing: { from, progress }`, `author`                               |
| `Reaction`        | `theme`, `reaction: { emoji, count, by, progress }`                           |
| `Composer`        | `theme`, `composer: { from?, text, caret, sending }`, `author?`               |
| `Avatar`          | `theme`, `participant`, `size?`                                               |

A `RenderedMessage` carries everything you need to draw a message at one instant:

```ts
interface RenderedMessage {
  id: string;
  from: string; // participant id
  variant: "message" | "system";
  content: ContentNode[]; // render with <MessageContent nodes={…} />
  revealProgress: number; // 0 → just appearing, 1 → fully shown
  state: "typing" | "sending" | "sent" | "edited" | "deleted";
  reactions: RenderedReaction[]; // your Reaction renders these
  isSelf: boolean; // the viewer — render on the "self" side
  isGrouped: boolean; // grouped with the previous (same author, close in time)
  atMs: number; // timeline timestamp (fabricate a clock time from it)
  system?: { card?: string; actions?: { label: string; href?: string }[] };
}
```

### Rendering message content

Don't walk `content` by hand — use the shared renderer, which handles text with
inline marks (`@mention`, link, `code`, emoji) and in-message images, and skips
unknown future node types:

```tsx
import { MessageContent } from "@typecaast/skin-kit";

<MessageContent
  nodes={message.content}
  styles={{ link: { color: tokens.link }, mention: { color: tokens.accent } }}
  imageStyle={{ borderRadius: 8, maxWidth: 320 }}
/>;
```

### Animate from progress, never from CSS transitions

Drive **all** motion from the progress values in `SimState` (`revealProgress`,
typing `progress`, reaction `progress`) using the primitives — never CSS
transitions or timers. This is what makes the live preview and the exported
video frame-identical:

```tsx
import { fadeSlideIn, popIn, TypingDots } from "@typecaast/skin-kit";

<div style={fadeSlideIn(message.revealProgress)}>…</div>;
<span style={popIn(reaction.progress)}>{reaction.emoji}</span>;
<TypingDots progress={typing.progress} />;
```

You can also slice text by `revealProgress` for a streaming/typewriter effect
(see the Claude Code TUI skin).

## Capabilities

Declare what your skin supports and how it represents each event/content type.
The engine **drops** anything you mark `unsupported` (or `false`) from your
render — while keeping it in the config, so switching skins restores it.

```ts
import type { Capabilities } from "@typecaast/skin-kit";

export const myCapabilities: Capabilities = {
  events: {
    message: "native",
    typing: "native", // "fallback" = degraded but present; "unsupported" = dropped
    reaction: "unsupported", // e.g. a terminal has no reactions
    system: "native",
    composerType: "native",
    send: "native",
  },
  content: { text: true, image: false }, // a terminal can't show images
  reactions: false,
  threads: false,
  readReceipts: false,
};
```

If you mark `reaction: "unsupported"`, your `Reaction` component is never called
— but you still provide it (it can be a no-op).

## Theme + tokens

Provide per-theme tokens and read them via context, or key your own palette by
the `theme` prop:

```tsx
import { useTheme, useTokens } from "@typecaast/skin-kit";

const theme = useTheme(); // "light" | "dark"
const tokens = useTokens(); // your SkinTokens for the active theme
```

`tokens` is `{ light: SkinTokens; dark: SkinTokens }` where `SkinTokens` is
open-ended (`{ colors: Record<string,string>, … }`). Dark mode is a first-class
design, not an inverted afterthought — pick real dark values.

## Fonts (the typeface is most of the fidelity)

Declare the fonts your skin needs; the renderer loads them on mount (live _and_
in export) so it never relies on a host OS font:

```ts
import type { FontDeclaration } from "@typecaast/skin-kit";

export const fonts: FontDeclaration[] = [
  {
    family: "Lato",
    intended: "Lato", // or e.g. "SF Pro" when you ship a substitute
    weights: [400, 700],
    sources: [
      { url: "https://…/lato-400.woff2", weight: 400, format: "woff2" },
    ],
  },
];
```

Only **open-licensed** fonts (OFL etc.) may be bundled. Where the real font
can't ship (e.g. SF Pro), use a documented substitute (Inter) and record both
`intended` and `family`.

## The pixel-perfect bar

Presets are held to the real app at the level of **spacing, type, color, and the
specific light/dark palettes** — not a generic approximation. Build from real
references and gate on visual regression. Copy the Storybook + Playwright setup
in [`packages/skins`](../packages/skins): write `*.stories.tsx` for your skin
(light + dark, deterministic frames), then `pnpm test:visual:update` to capture
baselines and `pnpm test:visual` to compare. Regenerate baselines in the pinned
runtime ([`docs/RENDERING.md`](./RENDERING.md)) so they're stable across
machines.

## A complete minimal skin

```tsx
import type { FC, ReactNode } from "react";
import { defineSkin, MessageContent, fadeSlideIn } from "@typecaast/skin-kit";
import type { FrameProps, MessageProps } from "@typecaast/core";

const Frame: FC<FrameProps & { children?: ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: "system-ui", background: "#fff", height: "100%" }}>
    {children}
  </div>
);

const Message: FC<MessageProps> = ({ message }) => (
  <div style={{ padding: "4px 12px", ...fadeSlideIn(message.revealProgress) }}>
    <MessageContent nodes={message.content} />
  </div>
);

const noop = () => null;

export const bare = defineSkin({
  id: "bare",
  meta: {
    name: "Bare",
    defaultCanvas: { width: 480, height: 640 },
    supportsThemes: ["light"],
    capabilities: {
      events: { message: "native" },
      content: { text: true, image: true },
      reactions: false,
      threads: false,
      readReceipts: false,
    },
  },
  components: {
    Frame,
    Message,
    SystemMessage: noop,
    TypingIndicator: noop,
    Reaction: noop,
    Composer: noop,
    Avatar: noop,
  },
});
```

Drop it on a page:

```tsx
import { Typecaast } from "@typecaast/react";
<Typecaast config={config} skin={bare} autoplay loop />;
```

## Submitting a skin

Built-in skins live in `@typecaast/skins` and are registered in `getSkin`.
Community skins go through a checklist before listing:

- No bundled proprietary marks or fonts; `"<Platform>-style"` naming.
- Light + dark (unless the real app is single-mode); declared fonts loaded.
- Capabilities declared honestly.
- Storybook stories + visual-regression baselines.
- Provenance declared; clean sample content (no real customer data).

**Faster paths:**

- **Scaffold:** `npm create typecaast-skin "<Name>"` generates a working skin
  folder (tokens, components, capabilities) to customize.
- **AI authoring skill:** the [`create-skin`](../.claude/skills/create-skin/SKILL.md)
  skill walks an agent from a reference screenshot (or a captured draft) all the
  way to a registered, theme-aware skin with stories and a visual baseline.
- Or copy the smallest existing skin (`claude-code`) as a starting point.
