---
"@typecaast/builder": patch
---

Builder polish round 4:

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
