---
"@typecaast/react": patch
---

`<Typecaast>` now preloads a config's images (participant avatars and in-message images) on mount, so they're cached before their message appears and no longer "pop in" late mid-playback. Warming starts as soon as the component mounts — even while the skin chunk is still loading — and is SSR-safe (a no-op where `Image` is undefined).
