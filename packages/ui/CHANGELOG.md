# @typecaast/ui

## 0.0.1

### Patch Changes

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

- e9b30e9: Timeline redesign in the builder: a wider column with two-line rows — each step
  shows a per-type **icon** and its type on line 1 and the full content preview on
  line 2 (no more one-line truncation). The step **Type** is now editable (a
  grouped dropdown that transforms the step, preserving compatible fields like
  from/text/id/delay). The add-step picker is grouped (Messages / Composing /
  Reactions & edits / Receipts & timing) with an icon + name + one-line description
  per type. Adds inline step-type icons and `.tc-steppick*` styles to `@typecaast/ui`.
