---
"@typecaast/skin-kit": minor
"@typecaast/skins": minor
---

Simulate @mention tagging in the composer across skins.

While typing in the reply box, a completed `@name` (committed once you type a
space past it) renders as a tag — matching how each platform shows a mention in a
sent message; a still-being-typed trailing `@name` stays plain. Other mrkdwn is
left literal, the way real composers show it while you type.

- **skin-kit:** new `renderComposerMentions(text, style?, className?)` helper.
- **skins:** Slack, Discord, Telegram, WhatsApp, iMessage, and Messages (macOS)
  tag mentions in their composer using that platform's own mention style.
  WhatsApp and iMessage gain a mention style (accent text / heavier weight) so
  tags render in their sent messages too. Cursor and Claude Code are unchanged —
  their `@` references files/context, not people.
