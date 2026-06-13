# Typecaast

> Simulate and record chat conversations in pixel-faithful renderings of real UIs — drop a `<Typecaast>` component on a page or export an MP4/GIF, all from one JSON config.

Typecaast plays back a scripted chat conversation — messages appearing on a delay, typing indicators, reactions landing slightly late, a user typing and sending a reply, content reflowing as the thread grows — inside a swappable, faithful UI (Slack, iMessage, WhatsApp, Discord, a Claude Code terminal, a Cursor panel, or a custom-captured UI).

One engine and one set of skins drive **two render targets**:

1. **JavaScript / React** — embeddable on a webpage, real-time playback.
2. **Video export** — deterministic frame rendering via Remotion → MP4 / GIF / WebM.

A visual **builder** assembles the timeline and emits the JSON config; a **hosted site** offers the builder as a playground plus docs and a preset gallery.

> **Status:** early development. See [`BUILD-CHECKLIST.md`](./BUILD-CHECKLIST.md) for live progress and [`PLAN.md`](./PLAN.md) for the full design spec.

## Licensing

Typecaast is **open-core** — read [`LICENSING.md`](./LICENSING.md) for the full table.

- **Runtime / SDK** (`@typecaast/core`, `schema`, `react`, `remotion`, `skins`, `skin-kit`, `cli`, `capture`) — **Apache-2.0** (open source).
- **Builder** (`@typecaast/builder`, `apps/site`) — **FSL-1.1-Apache-2.0** (source-available; converts to Apache-2.0 after two years).
- **Cloud render service** — proprietary, not in this repository.

Please don't describe the project as a whole as "open source": the runtime is, the builder is source-available.

## Trademarks & affiliation

Typecaast is an independent, unaffiliated tool. Skins are described as _"&lt;Platform&gt;-style"_, never official or endorsed. Trademarks belong to their owners; Typecaast is not affiliated with or endorsed by them. See [`TRADEMARKS.md`](./TRADEMARKS.md).
