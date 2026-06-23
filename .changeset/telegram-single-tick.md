---
"@typecaast/skins": patch
---

Telegram: show a single sent tick (✓) on outgoing messages instead of the double read tick (✓✓). Without a read-receipt step there's no "read" signal to represent, so a single sent tick is the accurate state.
