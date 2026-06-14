# Typecaast

> Simulate and record chat conversations in pixel-faithful renderings of real UIs — drop a `<Typecaast>` component on a page or export an MP4/GIF, all from one JSON config.

[![CI](https://github.com/corywatilo/typecaast/actions/workflows/ci.yml/badge.svg)](https://github.com/corywatilo/typecaast/actions/workflows/ci.yml)
[**Live site → typecaast.com**](https://typecaast.com) · [Playground](https://typecaast.com/playground) · [Gallery](https://typecaast.com/gallery) · [Docs](https://typecaast.com/docs)

Typecaast plays back a scripted chat conversation — messages appearing on a delay, typing indicators, reactions landing slightly late, a user typing and sending a reply, content reflowing as the thread grows — inside a swappable, faithful UI (Slack, iMessage, WhatsApp, Discord, a Claude Code terminal, a Cursor panel, or a custom-captured UI).

One engine and one set of skins drive **two render targets**:

1. **JavaScript / React** — embeddable on a webpage, real-time playback.
2. **Video export** — deterministic frame rendering via Remotion → MP4 / GIF / WebM.

A visual **builder** assembles the timeline and emits the JSON config; a **hosted site** offers the builder as a playground plus docs and a preset gallery.

## Quick start

Embed a live, animated conversation in React:

```bash
pnpm add @typecaast/react @typecaast/skins react
```

```tsx
import { Typecaast } from "@typecaast/react";
import { slack } from "@typecaast/skins";

const config = {
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [
    { id: "cory", name: "Cory", isSelf: true },
    { id: "paul", name: "Paul" },
  ],
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "typing", from: "paul" },
    { type: "message", from: "paul", text: "shouldn't error — looking now" },
    { type: "composerType", from: "cory", text: "thanks 🙏" },
    { type: "send" },
  ],
};

export default () => <Typecaast config={config} skin={slack} autoplay loop />;
```

No build step or design work required — the skin renders the platform's exact look in light and dark. Don't want to write JSON by hand? Build it visually in the [playground](https://typecaast.com/playground) and copy the config or embed snippet.

## Export to video

The same config renders deterministically to MP4 / GIF / WebM via the CLI:

```bash
npx @typecaast/cli render config.json --format mp4 --size 1080x1920 --scale 2
```

The React player and the video renderer sample the same engine frame-for-frame, so the export matches the embed exactly. See [`docs/RENDERING.md`](./docs/RENDERING.md).

## Skins

Seven faithful built-in skins ship today — Slack, iMessage, WhatsApp, Discord, Messages (macOS), Claude Code (terminal), Cursor — each in the platform's real light/dark language. Build your own from the seven-component contract ([`docs/authoring-skins.md`](./docs/authoring-skins.md)), or **capture** a real UI: the Chrome extension / saved-page importer distills a chat thread into an editable skin draft ([`docs/capturing-skins.md`](./docs/capturing-skins.md)).

## Develop locally

This repo is a pnpm + Turborepo monorepo. The site (landing, playground/builder, gallery, docs) is the Next.js app in `apps/site`.

```bash
pnpm install
pnpm build      # warm the workspace package dist so the site resolves cleanly
pnpm dev        # turbo: watch every package + run the Next dev server
```

Open **http://localhost:3000** — `/` (landing), `/playground` (builder), `/gallery`, `/docs`. `pnpm dev` runs everything in watch mode, so edits to a skin, `@typecaast/ui`, the builder, or the site hot-reload. For just the site (lighter, no live library edits): `pnpm --filter @typecaast/site dev`.

Common tasks: `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm format` · `pnpm --filter @typecaast/skins test:visual` (Playwright skin snapshots) · `pnpm --filter @typecaast/core bench`. See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Packages

| Package               | What                                                 | License            |
| --------------------- | ---------------------------------------------------- | ------------------ |
| `@typecaast/core`     | Framework-agnostic engine (pure `getStateAt(t)`)     | Apache-2.0         |
| `@typecaast/schema`   | Zod schema + JSON Schema + types                     | Apache-2.0         |
| `@typecaast/react`    | `<Typecaast>` + `useTypecaast`                       | Apache-2.0         |
| `@typecaast/remotion` | Video compositions + `renderVideo`                   | Apache-2.0         |
| `@typecaast/skins`    | Built-in platform skins                              | Apache-2.0         |
| `@typecaast/skin-kit` | `defineSkin`, contract, theme/font/animation helpers | Apache-2.0         |
| `@typecaast/capture`  | Distiller + sanitizer + template-skin adapter        | Apache-2.0         |
| `@typecaast/cli`      | `validate` / `render` / `scaffold-skin`              | Apache-2.0         |
| `@typecaast/builder`  | Embeddable visual editor                             | FSL-1.1-Apache-2.0 |

The shipped runtime contains **zero telemetry** — no analytics SDK, no phone-home (enforced in CI). Analytics live only on the hosted site; see [`ANALYTICS.md`](./ANALYTICS.md).

## Status

`0.1.0` (beta). The site is live at [typecaast.com](https://typecaast.com); packages publish to npm under `@typecaast/*`. See [`BUILD-CHECKLIST.md`](./BUILD-CHECKLIST.md) for progress and [`PLAN.md`](./PLAN.md) for the full design spec. Deployment topology: [`DEPLOY.md`](./DEPLOY.md).

## Licensing

Typecaast is **open-core** — read [`LICENSING.md`](./LICENSING.md) for the full table.

- **Runtime / SDK** (`@typecaast/core`, `schema`, `react`, `remotion`, `skins`, `skin-kit`, `cli`, `capture`) — **Apache-2.0** (open source).
- **Builder** (`@typecaast/builder`, `apps/site`) — **FSL-1.1-Apache-2.0** (source-available; converts to Apache-2.0 after two years).
- **Cloud render service** — proprietary, not in this repository.

Please don't describe the project as a whole as "open source": the runtime is, the builder is source-available.

## Trademarks & affiliation

Typecaast is an independent, unaffiliated tool. Skins are described as _"&lt;Platform&gt;-style"_, never official or endorsed. Trademarks belong to their owners; Typecaast is not affiliated with or endorsed by them. See [`TRADEMARKS.md`](./TRADEMARKS.md).
