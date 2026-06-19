---
"@typecaast/react": minor
---

New opt-in **`isolate`** prop on `<Typecaast>`. When set, the widget renders
inside an **open shadow root** (via `createPortal`) with a `:host { all: initial }`
reset, so a host page's global CSS — resets, Tailwind `.prose`, tag rules,
inherited `line-height`/font — can't leak in and distort it. Fonts are
unaffected (skins register them via the `FontFace` API, which crosses the shadow
boundary). Trade-off: it's **client-only** (a shadow root can't be attached
during SSR), so an isolated widget renders a correctly-sized box on the server
and hydrates its visuals in — it no longer drops into a pure React Server
Component. Default `false`, so existing embeds are unchanged.
