---
"@typecaast/react": minor
---

`<Typecaast>` gains declarative + imperative playback control:

- **`paused?: boolean`** — controlled pause/resume. `true` freezes in place;
  `false` resumes **from the current position** (never restarts). Omit it to keep
  today's `autoplay` behavior. No-op under `prefers-reduced-motion`. Solves the
  pause-on-hidden-tab case without unmounting.
- A **`ref`** handle (`TypecaastHandle`) for imperative control — `play`, `pause`,
  `seek` (jump to a time), `scrubTo`, `setRate`, `stepNext`, `stepPrev`, plus live
  `currentMs` / `duration` / `playing`.
- **`onPlay` / `onPause` / `onEnded`** lifecycle callbacks.

Internally, `useTypecaast` now applies `autoplay` once per player (mount) rather
than reactively, so toggling the controlled `paused` no longer tears down and
recreates the live player.
