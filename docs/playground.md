# Builder & playground

The hosted playground at [`/playground`](https://typecaast.com/playground) is
the same `<Builder />` component that ships from `@typecaast/builder`. This
guide walks through what's on screen and where each control lives, so the docs
keep step with the UI.

## Layout

```
┌────────────────────┬─────────────────────┬────────────────────┐
│ App │ Timeline │ … │      Preview        │ OPTIONS            │
│              Import│ ◀◀ ↻ ▶ ▶▶  ━━●━━━━ │ canvas / seed / …  │
│                    │                     │                    │
│   (left tab body)  │  (live skin render) │ EXPORT             │
│                    │                     │  Code | Video      │
│                    │                     │  …                 │
└────────────────────┴─────────────────────┴────────────────────┘
```

Three columns:

1. **Left** — a tabbed inspector with `App | Timeline | Participants`. The
   `Import` button lives at the right of the tab bar; the ⓘ inside it
   explains that importing a `typecaast.json` file replaces the entire
   current config (an undo away).
2. **Center** — the live skin preview with a transport bar (Restart · Prev ·
   Play/Pause · Next · scrub) and zoom controls (`Fit`, `Responsive`,
   explicit %). The preview is the primary editing surface, not a passive
   output: scrub, step frame-by-frame, and tweak pacing while it plays.
3. **Right** — `Options` and `Export` rendered as **stacked sections**
   (Figma-style headers), not a second tab bar. Both scroll together.

The top-left "Typecaast Builder" wordmark is always a link back to
[`/`](https://typecaast.com), regardless of which tab is active.

## Working in the builder (for contributors)

Every panel is a thin view over a **pure config transform** in
[`packages/builder/src/store.ts`](../packages/builder/src/store.ts): a panel
calls e.g. `setSkin(config, …)` / `addStep(config, …)` and passes the result up
via `onChange`/`update`. The store never mutates, so undo/redo and the
`localStorage` + URL-hash persistence come for free. The UI is
**capability-aware** — panels read the active skin's `meta.capabilities` (via
[`lint.ts`](../packages/builder/src/lint.ts)) to dim, warn on, or refuse steps a
skin can't render. The site renders the builder from the **built `dist`**, so
rebuild `@typecaast/builder` (or run its `dev` watch) to see source changes.

Each section below names its **Code** entry points (panel · store action ·
schema field). Adding a brand-new timeline **step type** is its own multi-file
procedure — use the `/add-step-type` skill (and the checklist in the root
[`CLAUDE.md`](../CLAUDE.md)).

## Left column tabs

### App

**Code:** [`panels/SkinPanel.tsx`](../packages/builder/src/panels/SkinPanel.tsx)
· store `setSkin` / `updateMeta` · schema `config.meta.skin` (`.id`, `.options`)
and `config.meta.composer`.

The home for everything specific to the chosen skin:

- **App** — picks a built-in skin, grouped by type: **Chat** (Slack, Discord),
  **Code** (Claude Code, Cursor), **Messaging** (iMessage, Messages, Telegram,
  WhatsApp). The id round-trips through `config.meta.skin.id`; unknown ids stay
  selected as `"<id> (unknown)"` so a config from a future skin isn't clobbered.
  A **Custom** entry explains how to bring your own UI (author a skin or capture
  one with the Chrome extension) — selecting it **pauses the editor** (the canvas
  and the Options/Export panels fade out, since there's no built-in skin to
  preview) until a real app is picked.
- **Options** — a small grid of skin-specific fields (channel, title, contact,
  status, and the Cursor `model` chip). They feed `config.meta.skin.options`.
- **Message input** — Auto / Always / Hidden composer visibility (driven by
  `config.meta.composer`).
- **Supported features** — an affirmative checklist. Every capability the
  skin renders shows a green ✓; ones it falls back on get a `(fallback)`
  suffix (e.g. iMessage rendering a `system` step as centred grey text).
  Unsupported capabilities are intentionally hidden here — they show up in
  the warning section instead, so this list reads as a positive summary.
- **Won't render in this skin** — a yellow warning panel that lists every
  step the active skin will drop at render time, e.g.
  `Step 3: Cursor panel drops "reaction" steps.` Switching to a skin that
  does support those events makes the panel go away; the original config
  isn't mutated.

### Timeline

**Code:**
[`TimelinePanel.tsx`](../packages/builder/src/TimelinePanel.tsx) +
[`StepEditor.tsx`](../packages/builder/src/StepEditor.tsx) +
[`steps.tsx`](../packages/builder/src/steps.tsx) (icons, descriptions, groups,
the `StepPicker`) · store `addStep` / `addStepAutoPaced` / `updateStep` /
`moveStep` / `deleteStep` / `duplicateStep` / `changeStepType` / `blankStep` ·
schema `config.timeline[]`. Step **labels** come from
[`format.ts`](../packages/builder/src/format.ts) (`stepLabel`).

Drag-reorderable rows of steps, each showing the step type, an icon, and a
short content preview on a second line. Hovering between rows reveals an
inline `+` insert zone; the `+ Step` bar at the bottom of the column is
always visible (it sits outside the scroll container, so a long step editor
can't hide it).

Capability awareness is woven through the timeline:

- The **+ Step picker** dims unsupported step types and refuses to add them,
  with a tooltip explaining why (e.g. _"Slack doesn't support 'readReceipt'
  steps."_).
- The **Type select** inside the expanded step editor disables the same
  unsupported options. Your current step type stays selectable so you can
  switch back to it later.
- A row whose type isn't supported by the active skin shows a small ⚠
  warning chip next to the step type, with the same explanation on hover.
- Inside the editor, a row whose current type would be skipped shows a
  prominent "drop" warning above the form fields.

### Participants

**Code:**
[`panels/ParticipantsPanel.tsx`](../packages/builder/src/panels/ParticipantsPanel.tsx)
· store `addParticipant` / `updateParticipant` / `removeParticipant` / `setSelf`
· schema `config.participants[]`.

Manage the cast of the conversation: name, id, color, kind (person / app),
avatar (file → inlined data URL, or pasted URL → kept as a link), and a
single-select **viewer** radio that marks the participant whose perspective
the simulation is rendered from.

## Preview pane

**Code:** [`Preview.tsx`](../packages/builder/src/Preview.tsx) — read-only; it
renders the config through `useTypecaast` + `<TypecaastStage>` and owns the
transport/zoom/theme controls (no store actions; it doesn't edit the config).

A live `<TypecaastStage>` rendering the current config with the active skin.
Controls:

- **Restart** (↻ rewound to start, then plays) · **Prev** (one step back) ·
  **Play / Pause** · **Next** (one step forward).
- **Scrub bar** with the current time readout in seconds.
- **Theme toggle** (light / dark / auto). In **Auto** the preview follows the
  page's own light/dark setting (and the browser preference when the page is also
  auto), not just `prefers-color-scheme`.
- **Zoom**: `Fit` scales the canvas down to the pane (capped at 100% so a
  small canvas in a big pane never gets blown up), `Responsive` reflows the
  skin to the pane width, plus explicit percentages from −/+ buttons.

The preview also auto-jumps to the final frame once a config first compiles
without errors, so a fresh import or page load shows the end state.

## Options section

**Code:** [`panels/OutputPanel.tsx`](../packages/builder/src/panels/OutputPanel.tsx)
· store `setCanvas` / `updateMeta` / `updatePacing` · schema
`config.meta.{canvas, seed}` and `config.pacing`.

Right column, top half — the settings that apply to **both** export paths:

- **Size preset** + Width/Height. The authoring/preview canvas size — also the
  video frame size and, for a responsive embed, the fallback aspect ratio.
  Presets stay sticky in the dropdown until you edit a dimension manually.
- **Seed** — drives jitter/humanise. The same seed always replays identically.
- **Pacing** — Reading WPM, Typing CPS, and a humanise slider that adds seeded
  random variation to delays so the timing feels less robotic.

Settings that only apply to one export path now live **with that path** in the
Export section below — **Responsive** + **Loop** under Code, **FPS** +
**Background** under Video. There's no separate "Fit" control: whether the embed
fills its parent is the **Responsive** toggle (Export → Code).

## Export section

**Code:** [`panels/ExportPanel.tsx`](../packages/builder/src/panels/ExportPanel.tsx)
(serializes via `toJSON`, handles download) · store `updateMeta` · schema
`config.meta.{assets, fit, loop, fps, background}` (Code writes `fit`/`loop`,
Video writes `fps`/`background` via the shared
[`BackgroundPicker.tsx`](../packages/builder/src/BackgroundPicker.tsx)). The
`Import` button in the left tab bar is
[`panels/ImportPanel.tsx`](../packages/builder/src/panels/ImportPanel.tsx) — it
replaces the whole config (one undo away).

Right column, bottom half. Two top-level paths via a `Code | Video`
segmented control. The **Assets** dropdown right below the toggle (`Inline
(self-contained)` vs `URL (referenced)`) controls how the JSON references
binary blobs; it's disabled for Video because video renders bake everything
in regardless.

### Code

An **Options** group sits at the top (writes `config.meta.fit` / `loop`):

- **Responsive** — on (default) fills the parent (`fit: "reflow"`); off
  downscales the canvas to fit the parent, preserving aspect ratio
  (`fit: "scale"`).
- **Loop** — auto-replay when the timeline ends (`config.meta.loop`).

Then three numbered steps:

1. **Install** — `npm` / `yarn` / `pnpm` segmented control + the install
   line for `@typecaast/react`. Click `⧉` in the top-right corner of the
   code block to copy.
2. **Embed snippet** — a zero-config React component:

   ```tsx
   import { Typecaast } from "@typecaast/react";
   import config from "./typecaast.json";

   export default function Demo() {
     return <Typecaast config={config} autoplay />;
   }
   ```

   The skin is lazy-loaded from `config.meta.skin.id` — no skin import, no
   `"use client"`. Drop straight into a React Server Component. `<Typecaast>`
   also accepts `className`/`style`, a controlled `theme` and `paused`, a `ref`
   for imperative control (`seek`, …), and `onPlay`/`onPause`/`onEnded` — see the
   [README props](../README.md#props).

3. **Content** — a truncated, fading preview of the JSON config. Click the
   preview to expand to the full document; the corner `⧉` button copies the
   complete JSON either way. A primary `⬇ Download typecaast.json` button
   sits below the preview.

### Video

- **FPS** — frames per second for the rendered video (`config.meta.fps`).
- **Background** — the colour (or transparent) behind the skin in the render
  (`config.meta.background`); a swatch + hex input with a Transparent toggle.

Then the CLI snippet for `typecaast render`. There's no hosted video render in
v1; the [`@typecaast/cli`](../packages/cli) takes the same JSON and produces an
MP4 locally via `@remotion/cli`. A "Render for me" entry point is reserved for
the future paid service.

## Persistence

Configs persist to `localStorage` and the URL hash, so a fresh tab restores
your work and you can share a link that loads the same config. `Import`
replaces both; `undo` (⌘Z) walks back through any change.

## Embedding the builder

`@typecaast/builder` exports the `Builder` component and a `BuilderEvent`
union for the funnel events you might want to forward to your own analytics:

```tsx
import { Builder } from "@typecaast/builder";
import { builtinSkins } from "@typecaast/skins";
import "@typecaast/ui/styles.css";

export default function Playground() {
  return (
    <Builder
      initialConfig={defaultConfig}
      skins={builtinSkins}
      onEvent={(e) => console.log(e)} // "preview_played" | "json_exported" | …
    />
  );
}
```

The hosted site mounts it client-only (it reads `localStorage` to restore
state). See [`apps/site/app/playground/page.tsx`](../apps/site/app/playground/page.tsx)
for the wiring.
