# Builder & playground

The hosted playground at [`/playground`](https://typecaast.com/playground) is
the same `<Builder />` component that ships from `@typecaast/builder`. This
guide walks through what's on screen and where each control lives, so the docs
keep step with the UI.

## Layout

```
┌────────────────────┬─────────────────────┬────────────────────┐
│ App │ Timeline │ … │      Preview        │ OPTIONS            │
│              Import│ ◀◀ ↻ ▶ ▶▶  ━━●━━━━ │ canvas / fps / …   │
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

## Left column tabs

### App

The home for everything specific to the chosen skin:

- **Skin** — picks one of the built-in skins (Slack, iMessage, Cursor, Claude
  Code, Telegram, WhatsApp, Discord, Messages-macOS). The id round-trips
  through `config.meta.skin.id`; unknown ids stay selected as
  `"<id> (unknown)"` so a config from a future skin doesn't get clobbered.
- **Options** — a small grid of skin-specific fields (channel, title,
  contact, status). They feed `config.meta.skin.options`.
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

Drag-reorderable rows of steps, each showing the step type, an icon, and a
short content preview on a second line. Hovering between rows reveals an
inline `+` insert zone; the `+ Step` bar at the bottom of the column is
always visible (it sits outside the scroll container, so a long step editor
can't hide it).

Capability awareness is woven through the timeline:

- The **+ Step picker** dims unsupported step types and refuses to add them,
  with a tooltip explaining why (e.g. *"Slack doesn't support 'readReceipt'
  steps."*).
- The **Type select** inside the expanded step editor disables the same
  unsupported options. Your current step type stays selectable so you can
  switch back to it later.
- A row whose type isn't supported by the active skin shows a small ⚠
  warning chip next to the step type, with the same explanation on hover.
- Inside the editor, a row whose current type would be skipped shows a
  prominent "drop" warning above the form fields.

### Participants

Manage the cast of the conversation: name, id, color, kind (person / app),
avatar (file → inlined data URL, or pasted URL → kept as a link), and a
single-select **viewer** radio that marks the participant whose perspective
the simulation is rendered from.

## Preview pane

A live `<TypecaastStage>` rendering the current config with the active skin.
Controls:

- **Restart** (↻ rewound to start, then plays) · **Prev** (one step back) ·
  **Play / Pause** · **Next** (one step forward).
- **Scrub bar** with the current time readout in seconds.
- **Theme toggle** (light / dark / auto).
- **Zoom**: `Fit` scales the canvas down to the pane (capped at 100% so a
  small canvas in a big pane never gets blown up), `Responsive` reflows the
  skin to the pane width, plus explicit percentages from −/+ buttons.

The preview also auto-jumps to the final frame once a config first compiles
without errors, so a fresh import or page load shows the end state.

## Options section

Right column, top half. Lays out:

- **Size preset** + Width/Height. Presets stay sticky in the dropdown until
  you edit a dimension manually.
- **Fit** — `Responsive` (skin reflows to the pane width), `Scale to fit`,
  or `Fixed size`.
- **FPS** — frames per second. **Disabled when Export = Code** (the live
  embed runs at the browser's frame rate); the field hovers a tooltip
  explaining why.
- **Seed** — drives jitter/humanise. The same seed always replays
  identically.
- **Background** — page background behind the skin.
- **Loop** — auto-replay when the timeline ends. **Disabled when Export =
  Video** (one-shot renders don't loop).
- **Pacing** — Reading WPM, Typing CPS, and a humanise slider that adds
  seeded random variation to delays so the timing feels less robotic.

## Export section

Right column, bottom half. Two top-level paths via a `Code | Video`
segmented control. The **Assets** dropdown right below the toggle (`Inline
(self-contained)` vs `URL (referenced)`) controls how the JSON references
binary blobs; it's disabled for Video because video renders bake everything
in regardless.

### Code

Three numbered steps:

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
   `"use client"`. Drop straight into a React Server Component.
3. **Content** — a truncated, fading preview of the JSON config. Click the
   preview to expand to the full document; the corner `⧉` button copies the
   complete JSON either way. A primary `⬇ Download typecaast.json` button
   sits below the preview.

### Video

The CLI snippet for `typecaast render`. There's no hosted video render in
v1; the [`@typecaast/cli`](../packages/cli) takes the same JSON and produces
an MP4 locally via `@remotion/cli`. A "Render for me" entry point is
reserved for the future paid service.

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
