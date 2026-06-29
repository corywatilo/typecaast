---
"@typecaast/schema": minor
"@typecaast/core": minor
"@typecaast/skin-kit": minor
"@typecaast/skins": minor
"@typecaast/builder": minor
---

Add Slack Block Kit support for app messages. App "cards" are now modeled the way Slack actually renders them — a regular `message` from an `app` participant carrying Block Kit content nodes (`header`, `section`, `context`, `divider`, `actions`, `image`, and a colored-bar `attachment`), with interactive `button` elements and `bold`/`italic`/`strike` inline marks (authored via Slack mrkdwn `*bold*`/`_italic_`/`~strike~` and `<@id>` mentions). The Slack skin renders the full block set; the builder gains a typed block editor.

The `system` step is now a text-only system/notice line (e.g. tool-output and "X joined" notices); its app-card-specific `card`/`actions` fields are removed — author cards as `message` + blocks instead.
