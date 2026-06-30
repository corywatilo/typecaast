---
"@typecaast/schema": minor
"@typecaast/core": minor
"@typecaast/skins": minor
"@typecaast/builder": minor
---

Add multi-line code blocks (Slack's fenced ``` block).

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
