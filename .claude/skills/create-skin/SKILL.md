---
name: create-skin
description: Author a new Typecaast skin from a reference screenshot, a platform description, or a captured draft. Use when the user wants to add a chat/UI skin to Typecaast (e.g. "make a Signal skin", "build a Teams skin from this screenshot", "turn this captured draft into a skin"). Two output paths — a hand-written component skin (Slack/Discord pattern, full fidelity) or a captured slot-template skin (faster, lower fidelity) — pick based on the input you have.
---

# Author a Typecaast skin

You are building a **skin**: the visuals that render a Typecaast `SimState` in
a specific app's exact language. The engine and the config are already solved
— you only build the look. Read
[`docs/authoring-skins.md`](../../../docs/authoring-skins.md) first; it is the
source of truth for the contract.

## Pick the right path

| Input | Best path |
| --- | --- |
| Reference screenshot or platform name only | **Component skin** (defineSkin, full theming, native typing/reactions). |
| Captured `*-skin-draft.json` from the Chrome extension, target app uses standard chat layout | **Slot-template skin** via the `/create-skin` editor — drop the JSON, polish, export. |
| Captured draft + the app has non-standard UI affordances we want (rich content, custom badges, multiple option fields) | **Component skin** — capture gives you tokens and a starting screenshot; you still hand-build the components. |

> Default to the slot-template path for first-party "looks like X" demos
> (e.g. PostHog web, Linear web). Use the component path for the official
> built-ins (Slack, Discord, iMessage…) where we want full fidelity, all
> capabilities native, and a maintainable component file.

## Trademarks (do this first)

Reproduce **layout, type, spacing, color** — never logos or proprietary
fonts. Name the skin `"<Platform>-style"`. Only bundle open-licensed (OFL)
fonts; substitute proprietary ones (e.g. SF Pro → Inter) and record both.
See `TRADEMARKS.md`.

---

## Path A — Slot-template skin (from a capture)

### 1. Capture

Have the user run the Chrome extension:

```bash
pnpm --filter @typecaast/extension build      # → extension/dist
```

Load `extension/dist` unpacked in `chrome://extensions`. **If you updated the
extension recently** (e.g. distiller / CSS-capture changes), prompt the user
to reload it before re-capturing — otherwise the new fields won't be in the
draft.

The user clicks the toolbar icon → **Pick & capture** → hovers the chat
thread → clicks. A `*-skin-draft.json` downloads.

### 2. Sanity-check the draft

Open `draft.json` and check:

- `meta.capturedAt.viewportWidth` (the source-page viewport) is recorded.
- `detection.message.confidence` should be > 0.5 and detected slots should
  include at least `body`. If lower, the user likely captured too wide —
  ask them to recapture a tighter subtree (just the thread).
- `detection.composer.found` — if `false`, the heuristic missed it. The
  user will fix it by hand in step 3.
- `css.length` — non-empty for class-driven apps (Tailwind/CSS modules).
  Empty CSS on a Tailwind app means CORS blocked the stylesheet read; the
  `cssSkipped` array names which sheets. Tell the user; they'll paste the
  rules into the CSS tab in the editor.
- `warnings` — read every line. Common ones:
  - "No composer detected" → fix by hand in editor.
  - "Message list is the captured root; no surrounding chrome was found"
    → capture a wider subtree (include the page chrome).
  - "Dropped N hidden element(s) from the capture" → informational, fine
    unless N is huge.

If the draft looks unrecoverable (no message slot, empty CSS on a complex
app), pivot to Path B (component skin).

### 3. Polish in the `/create-skin` editor

Open [typecaast.com/create-skin](https://typecaast.com/create-skin) locally
(`pnpm dev` from the repo root, then `/create-skin`). Drag the
`*-skin-draft.json` onto the page. The slots populate into tabs and you'll
see the result against a dummy conversation.

Common edits:

- **Composer not detected** → in Frame HTML, find the composer container,
  add `data-tc-slot="composer"`, replace its inner with `{{composer}}`. Then
  copy that block out to the Composer HTML tab.
- **Margins look wrong / content squeezed** → check `:host { … }` block in
  CSS for desktop pixel margins. The renderer auto-normalises symmetric
  `mx-` values, but explicit `max-width: 1200px` on the inner frame still
  needs `max-width: 100%` in your override CSS.
- **Slot markers visible but landing on the wrong node** → toggle "Show
  slot outlines" in the inspector and walk the structure. Move the
  `data-tc-slot="body"` attribute up/down a level until the outline
  matches the bubble.

Click **Download draft.json** when it looks right.

### 4. Drop into `packages/skins/src/<your-skin>/`

Create the folder. You need:

- `draft.json` — the polished output from step 3.
- `capabilities.ts` — minimal capability record. Copy from any built-in
  skin (e.g. `slack/capabilities.ts`) as a template.
- `index.ts`:
  ```ts
  import draft from "./draft.json" with { type: "json" };
  import { capabilities } from "./capabilities.js";
  import { slotSkinFromDraft, type SlotSkinDraft } from "@typecaast/skin-kit";

  export const <camelName> = slotSkinFromDraft(draft as SlotSkinDraft, {
    id: "<kebab-id>",
    capabilities,
  });
  export default <camelName>;
  ```

Skip to **Register & ship** below.

---

## Path B — Component skin (hand-written)

### 1. Scaffold

From `packages/skins/src/`:

```bash
node ../../create-typecaast-skin/dist/index.js "<Name>"
```

You get `index.ts`, `components.tsx`, `tokens.ts`, `capabilities.ts`,
`README.md`.

### 2. Tokens (`tokens.ts`)

From the reference, set the **real** light/dark palettes — background, text,
self/other bubble (or row) colors, borders, accent, composer. Dark mode is
first-class, not an inversion. Single-mode apps (terminals) set
`supportsThemes` to just `["dark"]`.

### 3. Components (`components.tsx`)

Match the target precisely:

- `Frame` — the chrome (header / window / status bar / sidebar) and the
  thread+composer layout. Pick an existing skin with the same shape:
  - bubbles → `imessage` / `whatsapp`
  - rows → `slack` / `discord`
  - terminal → `claude-code`
  - panel → `cursor`

  Reuse a skin's components when the UI is a desktop variant of an
  existing skin (see `messages-macos` reusing `imessage`).
- Render bodies with `<MessageContent nodes={message.content} styles={…} />`.
- Drive **all** motion from progress: `fadeSlideIn(message.revealProgress)`,
  `popIn(reaction.progress)`, `<TypingDots progress={typing.progress} />`.
  Never CSS transitions/timers — Remotion captures per frame.
- Honor `message.isGrouped` (drop the repeated avatar/name).

### 4. Capabilities (`capabilities.ts`)

Declare honestly. Mark what the UI lacks `unsupported` / `false` (terminals:
no reactions/images; Slack: no read receipts). The engine drops those from
the render but keeps them in the config.

### 5. Fonts

In `index.ts`, add `fonts: FontDeclaration[]` with OFL woff2 sources
(Fontsource/gstatic). Record `intended` when substituting.

### 6. Stories + visual baseline

Add `<name>.stories.tsx` with deterministic light+dark "complete" frames
(use `createEngine(config, theme, skin.meta.capabilities).getStateAt(
engine.durationMs * frac)` in a framed window — copy an existing
`*.stories.tsx`). Add the frozen story ids to `visual/skins.spec.ts`, then:

```bash
pnpm --filter @typecaast/skins build-storybook
pnpm --filter @typecaast/skins test:visual:update
```

### 7. Verify

A unit test `<name>.test.tsx` rendering the skin from a real `createEngine`
state via SSR (`renderToStaticMarkup`), asserting the chrome, a message,
theming, and any signature affordance render.

---

## Register & ship (both paths)

Both paths converge here. Four touchpoints make the skin a built-in:

1. **`packages/skins/src/registry.ts`** — add the import and an entry in
   `builtinSkins`.
2. **`packages/skins/package.json`** — add a `./<id>` subpath export.
3. **`packages/skins/tsup.config.ts`** — add the id to the `SKINS` array.
4. **`packages/react/src/builtin-skins.ts`** — add a `BUILTIN_SKIN_LOADERS`
   entry.
5. **`registry/skins.json`** — add a row. Mark `"official": true` for
   built-ins (CI's `pnpm check:registry` enforces this).

Group it in the App picker by editing `APP_GROUPS` / `APP_LABELS` in
`packages/builder/src/panels/SkinPanel.tsx`. Community-contributed captures
go under **Community**; first-party ones under Chat / Code / Messaging.

### Gates

Run the full repo gate before committing:

```bash
pnpm typecheck && pnpm lint && pnpm format:check && \
pnpm test && pnpm build && \
pnpm validate:examples && pnpm check:registry && pnpm check:no-telemetry
```

### Changeset

A new skin ships in `@typecaast/skins`, which is publishable. Add a
changeset (`pnpm changeset` → bump the affected packages) so the auto
"Version Packages" PR releases it.

## Quality bar

The skin ships only when it would pass as the **real app** at the level of
spacing, type, color, and the light/dark palettes — gated by the visual
baseline for component skins, by visual inspection in `/create-skin` for
slot-template skins. "Looks close" is not the bar. Iterate against the
reference until the captured baseline matches it.

## When capture won't get you there

If a captured draft has < 0.5 message confidence, empty CSS on a Tailwind
app (CORS-blocked stylesheet), or no composer slot **after** the user
hand-fixes it in the editor, switch to Path B. Capture gets ~80% of cases;
the remaining 20% need component code.
