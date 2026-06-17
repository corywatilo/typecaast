---
"@typecaast/builder": minor
"@typecaast/ui": patch
---

Timeline redesign in the builder: a wider column with two-line rows — each step
shows a per-type **icon** and its type on line 1 and the full content preview on
line 2 (no more one-line truncation). The step **Type** is now editable (a
grouped dropdown that transforms the step, preserving compatible fields like
from/text/id/delay). The add-step picker is grouped (Messages / Composing /
Reactions & edits / Receipts & timing) with an icon + name + one-line description
per type. Adds inline step-type icons and `.tc-steppick*` styles to `@typecaast/ui`.
