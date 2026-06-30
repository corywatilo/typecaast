# Authoring configs by hand

A Typecaast simulation is **one JSON config**. The visual playground
(<https://typecaast.com/playground>) is the easy way to build one, but the config
is plain JSON — you can write or edit it by hand in any editor (or have an LLM do
it). This is the reference for doing that without the playground.

> **Timing lives in its own guide.** "Why are my messages too fast / too close
> together?" and "how do I get ~1–2s between messages?" are answered in
> [pacing.md](./pacing.md). Read that one for anything about gaps, delays, and
> typing speed.

## The shape

```json
{
  "$schema": "https://typecaast.com/schema/v1/typecaast.schema.json",
  "version": 1,
  "meta": {
    "canvas": { "width": 880, "height": 720 },
    "skin": { "id": "slack" }
  },
  "participants": [
    { "id": "me", "name": "You", "isSelf": true },
    { "id": "sam", "name": "Sam" }
  ],
  "pacing": { "readingWpm": 240 },
  "timeline": [
    { "type": "message", "from": "sam", "text": "ship it?" },
    { "type": "message", "from": "me", "text": "shipping 🚀" }
  ]
}
```

That's a complete, valid config. Five top-level keys:

| Key            | Required | What it is                                                            |
| -------------- | -------- | --------------------------------------------------------------------- |
| `version`      | yes      | Config schema version. Currently `1` (a literal).                     |
| `meta`         | yes      | Canvas, skin, theme, fps — how it renders.                            |
| `participants` | yes      | Who is in the conversation.                                           |
| `pacing`       | no       | Global timing model. Omit for defaults. See [pacing.md](./pacing.md). |
| `timeline`     | yes      | The ordered list of steps that play out.                              |

Add the `$schema` line at the top and your editor gives you autocomplete and
inline validation against the live schema. It's optional but recommended.

## `meta`

```json
"meta": {
  "canvas": { "width": 880, "height": 720 },
  "skin": { "id": "slack", "options": { "channel": "#alerts" } },
  "fps": 30,
  "fit": "reflow",
  "theme": "auto",
  "seed": 42,
  "background": "transparent",
  "assets": "inline",
  "composer": "auto",
  "loop": false
}
```

| Field        | Default         | Notes                                                                                                 |
| ------------ | --------------- | ----------------------------------------------------------------------------------------------------- |
| `canvas`     | —               | `{ width, height }` in px. Required. The authoring reference size / the video frame.                  |
| `skin`       | —               | `{ id, options? }`. Required. `id` picks the skin (see [Skins](#skins)); `options` are skin-specific. |
| `fps`        | `30`            | Frames per second for video export.                                                                   |
| `fit`        | `"reflow"`      | `reflow` (re-wrap to container), `scale` (CSS-scale the canvas), or `fixed` (pin to px).              |
| `theme`      | `"auto"`        | `light`, `dark`, or `auto` (follows the host page; video resolves `auto` → `light`).                  |
| `seed`       | `42`            | Seeds all deterministic jitter — same seed ⇒ identical timings.                                       |
| `background` | `"transparent"` | `"transparent"` or any CSS color.                                                                     |
| `assets`     | `"inline"`      | `inline` (embed images as data URLs) or `url` (reference hosted images).                              |
| `composer`   | `"auto"`        | Reply box: `auto` (shown only while typing/sending), `always`, or `never`.                            |
| `loop`       | `false`         | Auto-replay at the end (unless the `<Typecaast>` consumer passes an explicit `loop`).                 |

## `participants`

An array of speakers. Reference them everywhere by `id`.

```json
"participants": [
  { "id": "me",  "name": "You", "isSelf": true },
  { "id": "sam", "name": "Sam", "avatar": "https://…/sam.png", "color": "#5b3a8e" },
  { "id": "bot", "name": "PostHog", "kind": "app" }
]
```

| Field    | Required | Notes                                                                            |
| -------- | -------- | -------------------------------------------------------------------------------- |
| `id`     | yes      | Stable id used by `from` / `target` / `by` in the timeline.                      |
| `name`   | yes      | Display name.                                                                    |
| `avatar` | no       | Data URL, or a hosted URL (per `meta.assets`).                                   |
| `color`  | no       | Accent color (CSS) some skins use for the author.                                |
| `isSelf` | no       | Marks the viewer — rendered on the "self" side and as the composer's author.     |
| `kind`   | no       | `"person"` (default) or `"app"` (a bot/integration; skins render it distinctly). |

Set `isSelf: true` on exactly one participant if you use the composer
(`composerType` / `send`).

## `timeline` — the steps

The timeline is an ordered array. Each step has a `type` and its own fields. Two
fields are shared by **every** step:

- `id` — optional. Give a step an id so a later `reaction`, `edit`, `delete`, or
  `readReceipt` can target it.
- `instant` — optional `true` to reveal with no animation and **no computed
  pacing gap** (handy when you want to control spacing yourself — see
  [pacing.md](./pacing.md)).

Steps that target an earlier message take a `target`: either a message's `id` or
the literal `"$prev"` (the most-recent message). `target` defaults to `"$prev"`.

### The step types

| `type`         | Purpose                                                                  |
| -------------- | ------------------------------------------------------------------------ |
| `message`      | An incoming message (optionally preceded by a typing indicator).         |
| `typing`       | A standalone typing indicator (no message need follow).                  |
| `composerType` | The `isSelf` participant typing into the composer, char by char.         |
| `send`         | Commit the composer's current text to the thread.                        |
| `reaction`     | An emoji reaction landing on a target message.                           |
| `edit`         | Replace a previously sent message's body.                                |
| `delete`       | Remove a previously sent message.                                        |
| `readReceipt`  | A read-receipt indicator (skins that support it).                        |
| `system`       | A system / notice line (e.g. "Sam joined #alerts") — not a chat message. |
| `delay`        | An explicit pause on the timeline. See [pacing.md](./pacing.md).         |

### `message`

```json
{ "type": "message", "from": "sam", "text": "on it" }
```

| Field     | Notes                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `from`    | Participant id. Required.                                                                             |
| `text`    | Message body. Supports Slack-style mrkdwn — see [message-content.md](./message-content.md).           |
| `images`  | `[{ src, alt?, width?, height? }]` — in-message images.                                               |
| `content` | Explicit Block Kit content nodes (wins over `text`) — see [message-content.md](./message-content.md). |
| `typing`  | Show a typing indicator first: `true`, or `{ "showTypingFor": 1800 }` (ms).                           |

Model an app "card" as a `message` from an `app` participant carrying `content`
(header/section/context/actions/…), **not** a `system` step.

### `typing`

```json
{ "type": "typing", "from": "sam", "showTypingFor": 1500 }
```

`showTypingFor` is in **milliseconds** (defaults to ~1500ms if omitted).

### `composerType` and `send`

```json
{ "type": "composerType", "from": "me", "text": "let me check…" },
{ "type": "send" }
```

`composerType` types into the composer (the `from` should be your `isSelf`
participant); `send` then posts it. `send.from` is optional — it inherits the
composer's author. `composerType.typingDuration` (ms) overrides the computed
typing time.

### `reaction`

```json
{ "type": "reaction", "target": "$prev", "emoji": "🚀", "delay": 800 }
```

| Field       | Notes                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `emoji`     | The emoji. Required.                                                                                                                                                                         |
| `target`    | Message id or `"$prev"` (default).                                                                                                                                                           |
| `from`      | Optional reactor.                                                                                                                                                                            |
| `shortcode` | Optional shortcode without colons (e.g. `"rocket"`) — shown in some skins' tooltips.                                                                                                         |
| `delay`     | Gap (ms) from when the target appears before the reaction lands. **This `delay` is a field on the reaction, not the `delay` step type** — don't confuse them (see [pacing.md](./pacing.md)). |

### `edit` and `delete`

```json
{ "type": "edit", "target": "m2", "text": "fixed typo" },
{ "type": "delete", "target": "m3" }
```

Both default `target` to `"$prev"`. `edit` takes the same body fields as
`message` (`text` / `images` / `content`).

### `readReceipt`

```json
{ "type": "readReceipt", "by": "sam", "target": "m2" }
```

`by` (who read it) and `target` (up to which message) are both optional.

### `system`

```json
{ "type": "system", "text": "Sam joined #alerts" }
```

A centered notice / tool-output line, rendered distinctly per skin. Takes the
same body fields as `message`.

### `delay`

```json
{ "type": "delay", "duration": 1500 }
```

An explicit pause. `duration` is in **milliseconds** and is **required**. This is
the most predictable way to space messages out — see [pacing.md](./pacing.md).

## Skins

`meta.skin.id` selects the skin. The conversation content is the same regardless
of skin; the skin decides how it looks. Built-in ids:

`slack` · `telegram` · `claude-code` · `imessage` · `messages-macos` ·
`whatsapp` · `cursor` · `discord`

Some steps aren't rendered by every skin (e.g. a terminal skin has no
reactions). The skin's capabilities decide; unsupported steps are dropped. Pick a
skin that supports the steps you use.

## Validate it

Always validate after editing by hand:

- **CLI:** `npx @typecaast/cli validate my-config.json` (exit 0 = OK; prints
  `E_*` errors / `W_*` warnings with locations and hints — see
  [errors.md](./errors.md)).
- **MCP:** if you've added the [`@typecaast/mcp`](../packages/mcp/README.md)
  server to your editor, call its `validate_config` tool. This is the easy loop
  when drafting a config (e.g. from a screenshot) in your own project.

## See also

- [pacing.md](./pacing.md) — timing, delays, and the "1–2s between messages" recipes.
- [message-content.md](./message-content.md) — message bodies: mrkdwn + Block Kit.
- The JSON Schema: <https://typecaast.com/schema/v1/typecaast.schema.json>.
- Machine-readable index for LLMs: <https://typecaast.com/llms.txt>.
  </content>
