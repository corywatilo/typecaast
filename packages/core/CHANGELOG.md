# @typecaast/core

## 0.6.0

### Minor Changes

- 3032c97: Add multi-line code blocks (Slack's fenced ``` block).

  A new `codeblock` content node (`{ type: "codeblock", text, lang? }`) renders as a
  monospaced, whitespace-preserving box — for tables, logs, and snippets. Distinct
  from the inline `code` mark, its `text` is literal (never parsed for marks).

  - **schema:** registered `codeblock` content node + `CodeBlockNode` type.
  - **core:** the pacing flattener counts a code block's text.
  - **skins (Slack):** renders the `codeblock` as a `<pre>` (full Block Kit fidelity);
    declares the `codeblock` content capability.
  - **builder:** a new "Code" block type with a monospaced, non-wrapping editor field.

  Tip: a wide monospace block won't reflow — give the instance a wide
  `meta.canvas.width` and `"fit": "scale"`, then scale it down in a sized wrapper on
  the host page (the canvas keeps its internal width, so the table stays one line per
  row). See the new `examples/retention-signals.json` and `docs/message-content.md`.

### Patch Changes

- Updated dependencies [3032c97]
  - @typecaast/schema@0.4.0

## 0.5.0

### Minor Changes

- 8e39694: Slack app messages via Block Kit, plus message-input and hover fixes.

  **Block Kit content.** App "cards" are now modeled the way Slack renders them — a regular `message` from an `app` participant whose `content` carries Block Kit nodes: `header`, `section` (with optional `accessory` + 2-column `fields`), `context` (text/image elements), `divider`, `actions`, `image`, and a colored-bar `attachment`. Buttons (`button` elements) support `primary`/`danger`/default styles, and text gains `bold`/`italic`/`strike` inline marks. Author text with Slack mrkdwn (`*bold*`, `_italic_`, `~strike~`, `` `code` ``) and `<@id>` mentions (resolved to participant display names). The Slack skin renders the full block set; other skins show the text and skip the rest. The builder gains a typed block editor. See `docs/message-content.md`.

  **`system` is now a notice line.** Its app-card-specific `card`/`actions` fields are removed — `system` renders as a system/notice line (e.g. "X joined", agent tool output). Author app cards as a `message` + blocks instead.

  **Fixes.** The composer ("reply box") now shows in `composer: "always"` mode even when no participant is marked `isSelf` (its author is optional). Slack messages gain a hover affordance (row background + gutter timestamp on grouped messages), roomier inter-message and inter-block spacing, and regular-weight mention pills.

### Patch Changes

- Updated dependencies [8e39694]
  - @typecaast/schema@0.3.0

## 0.4.0

### Minor Changes

- 3d0f6f7: Skin components' `Composer` now receives the skin's `options` (mirroring
  `FrameProps.options`), so a skin can label reply-box chrome from config. The
  **Cursor** skin uses it for a new **`model`** option — the reply box's model chip
  (defaults to "Mythos", editable in the builder). Cursor code snippets also get a
  hairline border to match Cursor's outlined code style.

## 0.3.0

### Minor Changes

- 49ad1e0: Add an optional `composer` (resolved `ComposerMode`) field to `FrameProps` so a
  skin's chrome can mirror reply-box visibility. iMessage uses it to hide the
  on-screen keyboard when the composer is hidden; other skins can ignore it.

### Patch Changes

- 33a0c23: Reveal composer text by code point instead of UTF-16 unit during a
  `composerType` animation, so an astral emoji (🎬, 🚀, …) is never split into a
  lone surrogate mid-type — which rendered as a "missing glyph" (□ / blue diamond)
  until the rest of the pair appeared.
- Updated dependencies [b6179ee]
  - @typecaast/schema@0.2.1

## 0.2.0

### Minor Changes

- c165c9a: Publish the timeline pacing change that already shipped to the playground: the
  `beat` step is renamed to **`delay`** (`{ "type": "delay", "duration": <ms> }`),
  and the per-step `delay`/`holdAfter` overrides are replaced by that explicit
  `delay` step (the base step shape is now just `id` + `instant`). Configs that
  used `beat`, or per-step `delay`/`holdAfter`, must migrate. This was already in
  the deployed playground but never released, so configs exported from it failed
  validation against the older published packages.

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0

## 0.1.1

### Patch Changes

- a857c1e: Fix: a sent message inherits the composer's sender. `send` commits whatever's in
  the composer, so the message is now always from whoever was typing — previously a
  stray `from` on the send step (e.g. a self-default) could mis-attribute it.

## 0.1.0

### Minor Changes

- 27bf6bc: Initial public beta of the Typecaast runtime + skins.

  - **Engine** (`@typecaast/core`): `compile(config)` + pure `getStateAt(t)`, seeded RNG, auto-pacing with overrides, capability resolution, the real-time `Player`, and the `SimState`/skin-prop contracts.
  - **Schema** (`@typecaast/schema`): versioned Zod config (meta/participants/pacing/content-node registry/timeline), generated JSON Schema, and reusable `validateConfig`.
  - **React renderer** (`@typecaast/react`): `<Typecaast>` + `useTypecaast`, reactive theme, font loading, fit modes.
  - **Video export** (`@typecaast/remotion`): frame-identical Remotion composition + a callable `renderVideo`.
  - **Skin kit** (`@typecaast/skin-kit`): the `Skin` contract, theme context, font loader, animation primitives, `MessageContent`.
  - **Skins** (`@typecaast/skins`): Slack, Claude Code (TUI), iMessage (iOS), WhatsApp — light + dark where applicable.
  - **CLI** (`@typecaast/cli`): `validate` and `render`.

### Patch Changes

- Updated dependencies [27bf6bc]
  - @typecaast/schema@0.1.0
