---
name: create-skin
description: Author a new Typecaast skin from a reference screenshot, a platform description, or a captured draft. Use when the user wants to add a chat/UI skin to Typecaast (e.g. "make a Signal skin", "build a Teams skin from this screenshot", "turn this captured draft into a skin"). Walks from reference → tokens → components → capabilities → fonts → stories + visual-regression baseline.
---

# Author a Typecaast skin

You are building a **skin**: the React components that render a Typecaast
`SimState` in a specific platform's exact visual language. The engine and the
config are already solved — you only build the look. Read
[`docs/authoring-skins.md`](../../../docs/authoring-skins.md) first; it is the
source of truth for the contract.

## Inputs you may get

- A **reference screenshot** of the target UI (best — extract real colors,
  spacing, type from it).
- A **platform name** ("Signal", "Teams", "Telegram") — find real reference
  imagery before guessing.
- A **captured draft** (`SkinDraft` from `@typecaast/capture`) — promote it.

## Trademarks (do this first)

Reproduce **layout, type, spacing, color** — never logos or proprietary fonts.
Name it `"<Platform>-style"`. Only bundle open-licensed (OFL) fonts; substitute
proprietary ones (e.g. SF Pro → Inter) and record both. See `TRADEMARKS.md`.

## Steps

1. **Scaffold.** From `packages/skins/src/`, run:
   `node ../../create-typecaast-skin/dist/index.js "<Name>"` (or
   `npm create typecaast-skin "<Name>"`). You get `index.ts`, `components.tsx`,
   `tokens.ts`, `capabilities.ts`, `README.md`.

2. **Tokens** (`tokens.ts`). From the reference, set the **real** light/dark
   palettes — background, text, the self/other bubble (or row) colors, borders,
   accent, composer. Dark mode is first-class, not an inversion. If the app is
   single-mode (a terminal), set `supportsThemes` to just `["dark"]`.

3. **Components** (`components.tsx`). Match the target precisely:
   - `Frame` — the chrome (header / window / status bar / sidebar) and the
     thread+composer layout. Look at an existing skin with a similar shape:
     bubbles → `imessage`/`whatsapp`; rows → `slack`/`discord`; terminal →
     `claude-code`; panel → `cursor`. Reuse a skin's components when the UI is a
     desktop variant (see `messages-macos` reusing `imessage`).
   - Render bodies with `<MessageContent nodes={message.content} styles={…} />`.
   - Drive **all** motion from progress: `fadeSlideIn(message.revealProgress)`,
     `popIn(reaction.progress)`, `<TypingDots progress={typing.progress} />`.
     Never CSS transitions/timers (Remotion captures per frame).
   - Honor `message.isGrouped` (drop the repeated avatar/name).

4. **Capabilities** (`capabilities.ts`). Declare honestly. Mark what the UI
   lacks `unsupported`/`false` (terminals: no reactions/images; Slack: no read
   receipts). The engine drops those from the render but keeps them in the config.

5. **Fonts.** In `index.ts`, add a `fonts: FontDeclaration[]` with OFL woff2
   sources (Fontsource/gstatic). Record `intended` when substituting.

6. **Register.** Export the skin from `packages/skins/src/index.ts` and add it to
   `builtinSkins` in `registry.ts`.

7. **Stories + visual baseline.** Add `<name>.stories.tsx` with deterministic
   light+dark "complete" frames (use `createEngine(config, theme,
skin.meta.capabilities).getStateAt(engine.durationMs * frac)` in a framed
   window — copy an existing `*.stories.tsx`). Add the frozen story ids to
   `visual/skins.spec.ts`, then `pnpm --filter @typecaast/skins build-storybook`
   and `pnpm --filter @typecaast/skins test:visual:update` to capture baselines.

8. **Verify.** A unit test (`<name>.test.tsx`) rendering the skin from a real
   `createEngine` state via SSR (`renderToStaticMarkup`), asserting the chrome,
   a message, theming, and any signature affordance render. Then:
   `pnpm --filter @typecaast/skins typecheck && test`.

## Quality bar

The skin ships only when it would pass as the **real app** at the level of
spacing, type, color, and the light/dark palettes — gated by the visual
baseline. "Looks close" is not the bar. Iterate against the reference
screenshot until the captured baseline matches it.
