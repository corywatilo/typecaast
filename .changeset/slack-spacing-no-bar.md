---
"@typecaast/skins": patch
---

Slack skin polish: seamless hover spacing and borderless app messages.

- Inter-message spacing now lives in each row's padding instead of margin, so a
  hovered message's highlight fills the surrounding space and adjacent highlights
  touch with no dead gap. Consecutive messages from the same sender sit closer
  (paragraph-level); a new sender gets more room above. A non-text element at the
  bottom (code block, buttons, image) or a reaction row gets extra bottom padding.
- App messages render their Block Kit content directly (section + buttons) rather
  than wrapped in a colored left-bar attachment — matching how Slack shows app
  messages. The `attachment` block is still supported for the explicit bar look.
