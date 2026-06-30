---
"@typecaast/schema": minor
"@typecaast/core": minor
"@typecaast/skin-kit": minor
"@typecaast/skins": minor
"@typecaast/builder": minor
---

Slack app messages via Block Kit, plus message-input and hover fixes.

**Block Kit content.** App "cards" are now modeled the way Slack renders them — a regular `message` from an `app` participant whose `content` carries Block Kit nodes: `header`, `section` (with optional `accessory` + 2-column `fields`), `context` (text/image elements), `divider`, `actions`, `image`, and a colored-bar `attachment`. Buttons (`button` elements) support `primary`/`danger`/default styles, and text gains `bold`/`italic`/`strike` inline marks. Author text with Slack mrkdwn (`*bold*`, `_italic_`, `~strike~`, `` `code` ``) and `<@id>` mentions (resolved to participant display names). The Slack skin renders the full block set; other skins show the text and skip the rest. The builder gains a typed block editor. See `docs/message-content.md`.

**`system` is now a notice line.** Its app-card-specific `card`/`actions` fields are removed — `system` renders as a system/notice line (e.g. "X joined", agent tool output). Author app cards as a `message` + blocks instead.

**Fixes.** The composer ("reply box") now shows in `composer: "always"` mode even when no participant is marked `isSelf` (its author is optional). Slack messages gain a hover affordance (row background + gutter timestamp on grouped messages), roomier inter-message and inter-block spacing, and regular-weight mention pills.
