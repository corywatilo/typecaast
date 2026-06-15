---
"@typecaast/core": patch
---

Fix: a sent message inherits the composer's sender. `send` commits whatever's in
the composer, so the message is now always from whoever was typing — previously a
stray `from` on the send step (e.g. a self-default) could mis-attribute it.
