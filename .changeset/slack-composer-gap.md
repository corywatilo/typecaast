---
"@typecaast/skins": patch
---

Slack: the reply box now butts up snugly against the last message. Its wrapper dropped the top padding and gained a small negative top margin, closing the visual gap between the newest message and the composer. The thread keeps its in-scroll bottom padding (which protects the newest message from the `column-reverse` scroll-edge clip when a host constrains the widget height), so this only tightens the gap — it never clips message content.
