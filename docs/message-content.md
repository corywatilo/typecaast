# Authoring message content

A message's body is authored in its `content`. The simplest form is a plain
`text` string; richer messages (especially **app messages**) use **Block Kit**
content nodes — the same primitives a real Slack app emits.

> The easiest way to author this is the [playground](https://typecaast.com/playground)
> — it has a typed block editor. This doc is the reference for the JSON it
> produces. Point your editor at the bundled JSON Schema
> (`"$schema": ".../typecaast.schema.json"`) for autocomplete.

## Plain text + mrkdwn

Most messages just need `text`. It's parsed for inline marks:

```json
{ "type": "message", "from": "cory", "text": "shipped *it* — see `deploy.ts`" }
```

| Syntax                 | Renders                                               | Inline node  |
| ---------------------- | ----------------------------------------------------- | ------------ |
| `*bold*`               | **bold**                                              | `bold`       |
| `_italic_`             | _italic_                                              | `italic`     |
| `~strike~`             | ~~strike~~                                            | `strike`     |
| `` `code` ``           | `code`                                                | `code`       |
| `https://…`            | a link                                                | `link`       |
| `@name`                | a mention pill                                        | `mention`    |
| `<@id>`                | a mention resolved to that participant's display name | `mention`    |
| emoji (`🟠`, `:tada:`) | the glyph                                             | left in text |

`<@id>` is the robust way to mention someone whose display name has spaces
(`<@joe>` → "@Joe Saunderson"); it resolves against `participants` at compile.

In-message images use the `images` sugar:

```json
{
  "type": "message",
  "from": "cory",
  "text": "here's the toast:",
  "images": [{ "src": "./toast.png", "alt": "error toast", "width": 320 }]
}
```

## App messages (Block Kit)

An **app message** is a normal `message` from a participant with
`"kind": "app"` — the sender drives the "APP" badge — whose `content` is a list
of Block Kit nodes. **Slack renders the full set; other skins show the text and
skip the rest** (a Slack-targeted config degrades gracefully elsewhere).

Blocks carry a `text` string (parsed like above) or pre-resolved `spans`:

```json
{
  "type": "message",
  "from": "posthog",
  "content": [
    { "type": "header", "text": "perf(inbox): Fix 26s admin inbox load" },
    {
      "type": "context",
      "elements": [
        {
          "type": "text",
          "text": "🟠 *P2* · Session replay · rvenvy/rvenvy-ai"
        }
      ]
    },
    { "type": "section", "text": "Sales reps hit prolonged loading spinners…" },
    {
      "type": "context",
      "elements": [
        {
          "type": "text",
          "text": "2 signals · Suggested reviewers: <@joe> <@cory>"
        }
      ]
    },
    { "type": "divider" },
    {
      "type": "actions",
      "elements": [
        { "type": "button", "label": "Review PR", "href": "https://…" },
        { "type": "button", "label": "Open in PostHog" },
        { "type": "button", "label": "Dismiss", "style": "danger" }
      ]
    }
  ]
}
```

### Block types

| Node         | Shape                                    | Notes                                                                                                                                                      |
| ------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header`     | `{ text }`                               | Large bold heading (plain text).                                                                                                                           |
| `section`    | `{ text \| spans, accessory?, fields? }` | A paragraph. `accessory` is a `button` or `image` to its right; `fields` is a 2-column grid of `{ text \| spans }`.                                        |
| `context`    | `{ elements: [...] }`                    | Small muted row; each element is `{ type:"text", text }` or `{ type:"image", src, alt? }`.                                                                 |
| `divider`    | `{}`                                     | A horizontal rule.                                                                                                                                         |
| `actions`    | `{ elements: [button…] }`                | A row of buttons.                                                                                                                                          |
| `image`      | `{ src, alt?, width?, height? }`         | A standalone image.                                                                                                                                        |
| `codeblock`  | `{ text, lang? }`                        | A monospaced preformatted box (Slack's fenced ` ``` ` block). `text` is **literal** — whitespace and newlines are kept and it is **not** parsed for marks. |
| `attachment` | `{ color?, content: [...] }`             | Nested blocks behind a colored left bar (the legacy "attachment" look). `color` is any CSS color.                                                          |

### Buttons

A `button` element appears in an `actions` block or as a `section` accessory:

```json
{
  "type": "button",
  "label": "View PR",
  "href": "https://…",
  "style": "primary"
}
```

- `style`: `"primary"` (filled green), `"danger"` (red outline), or omit for the
  default outlined button.
- `href`: with one, the button is a real link (opens in a new tab); without one
  it renders inert.

### Code blocks

For a table, log, or snippet, use a `codeblock` — Slack's fenced ` ``` `
block, a monospaced box that preserves whitespace and newlines verbatim. Unlike
the inline `` `code` `` mark (a single-line pill inside a sentence), a `codeblock`
is its own block and its `text` is **literal**: `*`, `~`, `<@id>` etc. are shown
as typed, never parsed. Author the canvas wide enough that the widest line fits on
one line, then scale the embed down on the page (see below).

```json
{
  "type": "message",
  "from": "posthog",
  "content": [
    {
      "type": "codeblock",
      "text": "Metric        A     B\nReturned      64%   96%\nActive weeks  2.9   7.2"
    }
  ]
}
```

A wide monospace block won't reflow, so give the instance a wide
`meta.canvas.width` and set `"fit": "scale"`; the host wraps it in a sized
container and the whole instance scales down to fit (the canvas keeps its internal
pixel width, so the table stays one line per row).

### The colored bar (attachment)

To get the legacy left-bar card look, wrap blocks in an `attachment`:

```json
{
  "type": "message",
  "from": "posthog",
  "content": [
    {
      "type": "attachment",
      "color": "#36a64f",
      "content": [
        { "type": "section", "text": "Pull request opened." },
        {
          "type": "actions",
          "elements": [
            { "type": "button", "label": "View PR", "style": "primary" }
          ]
        }
      ]
    }
  ]
}
```

## System / notice lines

The `system` step is **not** an app card — it's a non-message notice line
("X joined #channel", an agent's tool-output line), rendered distinctly per skin
(centered/muted in Slack, iMessage, WhatsApp; an agent line in Cursor/Claude
Code). It carries only `from?` + text/`content`:

```json
{ "type": "system", "from": "posthog", "text": "Cory joined #signals" }
```

## The reply box

The composer ("reply box") visibility is set by `meta.composer`: `"auto"`
(default — shown only while someone is composing), `"always"` (always shown,
idle when nobody is typing — no `isSelf` participant required), or `"never"`.
