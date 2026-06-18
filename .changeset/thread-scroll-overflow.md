---
"@typecaast/skin-kit": patch
---

The message thread now **scrolls** when a conversation is taller than the
available height, instead of clipping older messages out of reach. The viewport
uses `flex-direction: column-reverse`, so the newest message and the composer
stay pinned to the bottom and the thread scrolls from the bottom with the top
reachable — entirely in CSS, so it renders identically in a live embed, an SSR
page, and a video frame. WebKit/Blink use the OS overlay scrollbar; Firefox gets
a thin one.
