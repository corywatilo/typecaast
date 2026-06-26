---
"@typecaast/react": patch
---

`<Typecaast>` no longer restarts the conversation when the host re-renders. Theme is now a pure render concern — flipping light/dark re-paints the current frame instead of rebuilding the player at t=0 — and the config prop is de-duped by content, so a host that passes a structurally-identical config inline on each render (or re-renders for any unrelated reason) keeps playing in place. The embed only starts over if it is actually unmounted/remounted.
