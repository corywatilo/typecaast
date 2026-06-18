# @typecaast/builder

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
