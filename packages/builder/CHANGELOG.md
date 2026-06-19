# @typecaast/builder

## 0.3.2

### Patch Changes

- 7936528: Add a **"Render in shadow DOM"** toggle to the Export → Code "Options" group
  (next to Responsive + Loop). When on, the generated embed snippet adds the
  `isolate` prop and a `"use client"` line, so the copied code is correct for the
  client-only isolated mode. A tooltip + docs link explains the trade-off.
- Updated dependencies [afd7111]
  - @typecaast/react@0.5.0

## 0.3.1

### Patch Changes

- f5a71da: Clean up the App (formerly "Skin") selector: rename the field to **App** and
  group the built-in apps by type — **Chat** (Slack, Discord), **Code** (Claude
  Code, Cursor), **Messaging** (iMessage, Messages, Telegram, WhatsApp) — with the
  Cursor skin shown simply as "Cursor". A **Custom** entry explains how to bring
  your own UI (author a skin or capture one with the Chrome extension) and links to
  the docs.
- 5ae1937: Move builder settings to where they apply: **Background** and **FPS** (video-only)
  now live in Export → **Video**; **Loop** (code-only) moves into Export → **Code**
  as part of an **"Options"** group alongside **Responsive**. The Options panel keeps
  the canvas size, seed, and pacing. The embed snippet note now documents the
  `className`, `style`, and `theme` props.
- 3d0f6f7: Skin components' `Composer` now receives the skin's `options` (mirroring
  `FrameProps.options`), so a skin can label reply-box chrome from config. The
  **Cursor** skin uses it for a new **`model`** option — the reply box's model chip
  (defaults to "Mythos", editable in the builder). Cursor code snippets also get a
  hairline border to match Cursor's outlined code style.
- 31b9ef4: When **Custom** is selected in the App tab, the editor now pauses instead of
  silently keeping the previous preview: the canvas and the Options/Export panels
  fade out and become non-interactive, with an "Editor paused" indicator prompting
  you to pick a built-in app to continue. The App selector stays live so you can
  switch back.
- 10ef525: Tweak two canvas size presets: **Slack** is now 600×500 (was 880×720) and
  **Phone** is a bit shorter at 390×760 (was 390×844).
- e2c8d52: The playground preview's **Auto** color mode now follows the **page/host theme**
  instead of only `prefers-color-scheme`: when the preview theme is Auto it uses
  the builder's resolved chrome theme (which already reflects the page's Light /
  Dark / Auto setting, falling back to the browser preference when the page is also
  Auto). Explicit Light/Dark in the preview still override.
- 7a4034c: Rework the sizing controls around a clearer model. The 3-way **Fit** dropdown is
  gone; **Options** now shows the canvas **Size preset + Width/Height** always (the
  authoring/preview size, also the video frame size and the responsive fallback
  aspect ratio). The reflow-vs-scale choice moves to **Export → Code** as a
  **"Responsive widget"** checkbox (on by default): on = the embed fills its parent
  (`fit: "reflow"`), off = it downscales to fit the parent preserving aspect ratio
  (`fit: "scale"`). Video still renders at the canvas dimensions. (`"fixed"` is no
  longer offered in the builder but remains valid in the schema for older configs.)
- Updated dependencies [3d0f6f7]
- Updated dependencies [d5b3c8f]
  - @typecaast/core@0.4.0
  - @typecaast/skin-kit@0.3.2
  - @typecaast/react@0.4.0

## 0.3.0

### Minor Changes

- bd032dc: Add a `headerNav` prop to `<Builder>` — content rendered immediately right of the
  wordmark in the header (e.g. site nav links), so an embedding app can surface its
  own navigation in the builder chrome without stacking a second header above it.

### Patch Changes

- 2c65190: Builder Options: **Fit** now comes first (it decides whether an explicit canvas
  size matters), and the Size preset + Width/Height controls are hidden in
  **Responsive** mode — where the embed fills its container, so an explicit size
  is moot. Scale/Fixed still show them.
- Updated dependencies [be501a8]
  - @typecaast/skin-kit@0.3.1
  - @typecaast/react@0.3.1

## 0.2.5

### Patch Changes

- 53bb591: Builder polish round 4:

  - The inline `⧉` copy icons on every export code block now anchor their
    "Copy to clipboard" tooltip on the icon itself, not the top-left of the
    surrounding code block (the absolutely-positioned trigger had collapsed
    the tooltip wrapper to a zero-size box).
  - Disabled fields with a "why?" tooltip (Assets in Video mode, FPS in Code
    mode, Loop in Video mode) now show `cursor: not-allowed` over the inner
    control instead of inheriting the control's own `pointer/text` cursor.
  - The App tab now renders only the active skin's actual options. Skins
    expose different keys (Slack: `channel`; iMessage: `contact`; Cursor:
    `title`; …) and the previous hard-coded `Channel / Title / Contact /
Status` grid silently dropped most of them. The UI introspects the
    skin's Zod `optionsSchema` and only renders text fields that the skin
    actually consumes.
  - Drop the `Auto` Message-input mode — two states (Always / Hidden) is
    the cleaner UX. Existing `auto` configs are treated as `Always` for
    display; the schema still accepts `auto` for back-compat.
  - Background gets a real colour picker: a native swatch + hex input +
    a Transparent checkbox toggle, instead of a freeform text field.
  - Right sidebar reaches the edge: dropped `scrollbar-gutter: stable` so
    the Options/Export sections no longer leave a permanent ~14px gap
    along the right side of the panel.
  - Added a top border to the Export section header so adjacent stacks
    read as two slabs rather than one continuous run; nudged the Humanize
    slider away from the WPM/CPS row above it.

- Updated dependencies [33a0c23]
- Updated dependencies [b6179ee]
- Updated dependencies [49ad1e0]
- Updated dependencies [49ad1e0]
- Updated dependencies [33a0c23]
  - @typecaast/core@0.3.0
  - @typecaast/react@0.3.0
  - @typecaast/schema@0.2.1
  - @typecaast/skin-kit@0.3.0

## 0.2.4

### Patch Changes

- Updated dependencies [36e0f43]
  - @typecaast/react@0.2.5
  - @typecaast/skin-kit@0.2.3

## 0.2.3

### Patch Changes

- Updated dependencies [1ad9881]
  - @typecaast/react@0.2.4

## 0.2.2

### Patch Changes

- Updated dependencies [9c84658]
  - @typecaast/skin-kit@0.2.2
  - @typecaast/react@0.2.3

## 0.2.1

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/react@0.2.2
  - @typecaast/skin-kit@0.2.1

## 0.2.0

### Minor Changes

- fd9c061: Builder restructure + capability-aware UI.

  **Layout.** The right-column tab bar is gone. Options and Export are now
  stacked sections (Figma-style headers) inside a single scroll surface, and
  the App tab moved to the left column alongside Timeline and Participants —
  so the tab order reads `App | Timeline | Participants`. The Typecaast
  wordmark is now a link back to `/`. Import sits to the right of the tab bar
  with the ⓘ baked inside the button (the whole pill is the tooltip
  trigger). The header Export button is gone now that Export lives in the
  right column.

  **Capability awareness throughout.** A new `stepCapability(type, skin)`
  helper centralises per-step support lookup. The `+ Step` picker dims and
  disables step types the active skin doesn't support, with a tooltip
  explaining why. The Type select inside the step editor disables those same
  options. Timeline rows whose type isn't supported by the active skin show a
  ⚠ chip; opening a stranded step pops a yellow "drop" warning above its form
  fields. The App tab replaces the chip badges with a positive **Supported
  features** checklist (themes + capabilities, with a `(fallback)` suffix for
  non-native renders) and renames the lint section to **Won't render in this
  skin** with a proper warning panel.

  **Export.** New `Code | Video` segmented at the top of the Export section.
  The Assets dropdown turns into a regular `Select` so it doesn't compete
  with the parent tabs. Code path now reads as a numbered checklist —
  ① Install (npm/yarn/pnpm), ② Embed snippet, ③ Content with a truncated
  fading-mask JSON preview that expands on click and a `⬇ Download
typecaast.json` button. Every code block has a pinned `⧉` copy icon in its
  top-right corner.

  **Conditional Options.** `FPS` is disabled with an explanatory tooltip when
  the export mode is Code (the live embed runs at the browser's frame rate).
  `Loop` is disabled in Video mode (one-shot renders don't loop). `Assets`
  is disabled in Video mode (renders bake everything in regardless).

  **Tooltip primitive.** The shared `Tooltip` / `InfoTip` popover now sizes to
  content with a 240px cap (no more giant boxes for short labels) and flips
  to position **below** the trigger when there isn't enough room above —
  fixes header-button tooltips clipping off the top of the viewport. Hugs
  its target via `translateX(-50%)`.

  **Misc polish.** The system message action API gains an optional `variant:
"primary" | "secondary"` and an optional `href` (rendered as a real
  `target="_blank"` link in Slack; un-linked actions show a `cursor: not-
allowed`). The `composerType` step editor now actually explains what the
  step is for. The player bar reorders to Restart → Prev → Play/Pause →
  Next, with proper SVG icons at 18px and no more "rewind" glyph on the
  play button. The "+ Step" bar moved out of the timeline scroll container
  so a tall step editor never hides behind it. The Card hover affordance
  darkens the border instead of flipping the background, with the icon and
  type tinted accent on hover.

- 79daf09: Playground/builder polish: the preview now reliably opens on the final frame;
  the Timeline/Participants column no longer changes width between tabs; the
  Participants panel (renamed from "Cast") gains participant **avatars** (upload
  an image → inlined data URL, or paste a hosted image URL → kept as a link) and
  a single-select **viewer** radio (was a checkbox), and "Kind" is relabeled
  "Type". Options tooltips no longer clip against the scrolling column, the
  redundant "Swap orientation" button is gone, and the Fit option reads
  "Responsive". Export drops `loop` from the default embed, adds npm/yarn/pnpm
  install tabs, and a "Preview JSON" toggle.
- e9b30e9: Timeline redesign in the builder: a wider column with two-line rows — each step
  shows a per-type **icon** and its type on line 1 and the full content preview on
  line 2 (no more one-line truncation). The step **Type** is now editable (a
  grouped dropdown that transforms the step, preserving compatible fields like
  from/text/id/delay). The add-step picker is grouped (Messages / Composing /
  Reactions & edits / Receipts & timing) with an icon + name + one-line description
  per type. Adds inline step-type icons and `.tc-steppick*` styles to `@typecaast/ui`.

### Patch Changes

- Updated dependencies [fd9c061]
- Updated dependencies [e9b30e9]
  - @typecaast/ui@0.0.1

## 0.1.1

### Patch Changes

- Updated dependencies [97da731]
  - @typecaast/react@0.2.1

## 0.1.0

### Minor Changes

- a857c1e: Builder/playground UX: preview zoom with Fit/Responsive modes (large canvases no
  longer render tiny), the `+ Step` control sits below the steps and sticks to the
  pane only on overflow (and scrolls the new step into view), Import moved to the
  Timeline/Cast row, and the exported embed snippet is now zero-config
  (`<Typecaast config={config} />` — no skin import, no `"use client"`) with an
  `npm install @typecaast/react` line. The `send` step editor drops the redundant
  From field (it inherits the composer's sender).

### Patch Changes

- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/react@0.2.0
  - @typecaast/skin-kit@0.2.0
  - @typecaast/core@0.1.1

## 0.0.1

### Patch Changes

- Updated dependencies [27bf6bc]
  - @typecaast/schema@0.1.0
  - @typecaast/core@0.1.0
  - @typecaast/react@0.1.0
  - @typecaast/skin-kit@0.1.0
