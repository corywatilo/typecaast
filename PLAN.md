# Typecaast — Project Plan

> **Name: Typecaast** (two a's) — confirmed available across npm, GitHub, and the `typecaast.com`/`.dev` domains. Personal project, vendor-neutral, **open-core**: the runtime/SDK is true OSS (Apache-2.0); the builder app is **source-available (FSL-1.1-Apache-2.0)**; the hosted render service is proprietary. See §17. (One license term used everywhere — never call the whole project "open source.")
>
> **A note on "pixel-perfect":** it's the *engineering bar* — presets are built and regression-tested to match real references. Public/marketing wording is **"pixel-faithful / high-fidelity"** because some platforms require font/mark substitutes (e.g. Inter for SF Pro), so literal pixel parity isn't guaranteed for every skin. The ambition is unchanged; the claim is just honest.
>
> **One-liner:** Simulate and record chat conversations in pixel-faithful renderings of real UIs — drop a `<Typecaast>` component on a page or export an MP4/GIF, all from one JSON config.
>
> **Note on positioning:** This is *your personal* project (open-core, see §17), not a PostHog product. A PostHog skin ships by default purely as a nice marketing/coverage hook — the project itself is brand-neutral.

This document is the source of truth for scope, architecture, and sequencing. It is written to be implementation-ready: a contributor (or an AI agent) should be able to start building from it without further design decisions.

---

## 1. Goal & non-goals

### What we're building
A library that plays back a scripted chat conversation — messages appearing on a delay, typing indicators, reactions landing slightly late, a user typing and sending a reply, content reflowing/scrolling as the thread grows — inside an arbitrary, swappable UI (Slack, iMessage, WhatsApp, Discord, PostHog's Max AI chat, a Cursor-style panel, a terminal, or a custom-captured UI).

Two render targets share **one engine and one set of skins**:
1. **JavaScript / React** — embeddable on a webpage, real-time playback.
2. **Video export** — deterministic frame rendering via Remotion → MP4/GIF/WebM.

A **visual builder** assembles the timeline and emits the JSON config; a **hosted site** offers the builder as a playground plus docs and a preset gallery.

### Pixel-faithful is the point
The whole reason for passing in HTML / capturing the DOM is that the rendered conversation should be a **faithful match of the specific target UI** — not a stylized approximation. This is essential for high-quality demos and is the project's defining quality bar. Internally we hold presets to a **pixel-perfect** standard (regression-tested against real references); we describe it publicly as **"pixel-faithful / high-fidelity"** because a few platforms require licensed-font/mark substitutes (e.g. Inter for SF Pro), so literal per-pixel parity isn't guaranteed everywhere — and overclaiming invites exactly the scrutiny we'd rather earn. The UI does **not** need to be interactive beyond the three things we animate: **typing (composer), posting a message, and showing typing indicators.** Everything else (menus, buttons, sidebars) is rendered faithfully but inert.

### Primary use case
Demonstrating how interacting with AI chat works across different surfaces (Slack, an app's own chat, the MCP inside Cursor, Claude Code in a terminal, etc.) — for marketing, docs, changelogs, and social.

### Non-goals (v1)
- Not a real chat client or backend — no networking, no live messages, no persistence of conversations beyond config files.
- Not full interactivity — only typing, posting, and typing indicators animate; the rest of the UI is faithful but static.
- Not an AI/LLM integration — message content is authored, not generated (a future "script from a prompt" helper is out of scope).
- **Content types:** v1 ships **text + emoji + @mentions + code/links + in-message images** only. Attachment cards, link previews, and video embeds are explicitly **out of scope** — but the content model is built as an extensible node type registry so new kinds slot in later without schema breaks (see §6/§7).
- **No audio** — these simulations are silent. No SFX, no mixing, not planned.

### Platform-specific rendering is expected
The same authored event can render differently per skin — or not at all. A typing event shows as "X is typing…" in Slack, as the three-dot bubble in iMessage/Messages, and may be omitted entirely by a skin that has no such affordance. This is handled by a **capability model** (§7): each skin declares what it supports and how it represents each event/content type, and the engine degrades gracefully for anything unsupported.

---

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Fidelity | **Pixel-perfect engineering bar** (regression-tested vs references); publicly described as **"pixel-faithful"** since some skins use font/mark substitutes. Only typing/posting/typing-indicators animate; rest is faithful but inert. |
| UI architecture | **Headless core + skins.** Engine owns timeline/state; each UI is reused by both renderers. Two skin kinds: hand-authored **component** skins (presets) and **captured** template skins (HTML/DOM). |
| Custom UI capture | **Both in v1:** Chrome extension (scrape live DOM/CSS) **and** saved-webpage import (.html/MHTML). *(Highest-risk scope — see §11 sequencing.)* |
| Light / dark mode | Skins support both. Instance prop `theme="light" \| "dark" \| "auto"`; **auto** inherits the host page's `prefers-color-scheme`. **Video export defaults to `light`** when unspecified. |
| Content types | v1 = text/emoji/mentions/code/links + **in-message images**. Attachment cards, link previews, video embeds **out of scope**, but built on an **extensible content-node registry**. |
| Per-platform rendering | **Capability model:** each skin declares which events/content it supports and how (e.g. typing differs Slack vs Messages, or is omitted). Unsupported items are dropped per-skin but kept in config. |
| In-message images | Supported. Same hosting model as avatars (see below). |
| Timeline authoring | **Auto-paced with overrides.** Engine computes delays from text length / WPM; every value is overridable per step. |
| v1 surface area | React component + JSON schema + **Slack preset**, **Remotion export (self-hosted)**, **visual builder**, **hosted site (UI/embed only)** — all in v1. |
| Monorepo / build | **pnpm workspaces + Turborepo + tsup**, TypeScript-first, **Changesets** for releases. |
| Presets (v1) | Slack (required), **Claude Code TUI**, **Cursor panel**, **iMessage (iOS)** + **Messages (macOS)** as separate skins, **WhatsApp**, **Discord/Telegram**. **PostHog** added later via Chrome-extension capture. Built from real references, not guesses. |
| Skin ecosystem | Public skin contract + **`create-typecaast-skin`** scaffold + **AI authoring skill** + docs + community registry, so anyone can add a platform. |
| Paid video service | Future, **Stripe**, **one-time per video**; one re-export for minor edits; light+dark bundle at a small uplift. |
| Hosting | **Next.js on Vercel.** Site generates **UI/embeds only**; video export is OSS/self-run. Planned paid **per-video** offering (one-time, not subscription). |
| Asset hosting | Generator/site → **inline data URLs**. Embedded use → user may opt to host images in their own repo and reference by URL. |
| Analytics | **PostHog** on the hosted site/builder only (page views, builder funnel, purchase funnel + recordings/flags). **Never** bundled into the embeddable npm packages. Reverse-proxied. **Content sharing is opt-in:** default obfuscates authored content (interactions only); explicit opt-in shares text/config to improve the product, revocable. (§27) |
| Infra automation | Provision/configure via **MCPs** (Vercel, Cloudflare, Stripe, PostHog) instead of manual console work, where available. (§28) |
| Secrets | Public repo, but **all secrets live in CI/host env**, never committed; server-only paid/render code isolated. (§29) |
| License / positioning | **Open-core.** Runtime/SDK + first-party skins = **Apache-2.0** (true OSS, drives adoption + community skins). Builder app + site = **FSL-1.1-Apache-2.0** (source-available, non-compete, converts to Apache in 2y). Cloud render service = **proprietary/private**. One term used everywhere; never "open source" for the whole. See §17. Not a PostHog product; PostHog skin is a marketing hook. |

---

## 3. The one architectural rule that makes everything work

**The engine is a pure function of time.**

```ts
core.getStateAt(timeMs: number): SimState
```

Given a timestamp, the engine returns the *complete* state of the conversation at that instant: which messages are visible, how far a typing animation has progressed, what's currently in the composer, the scroll position, etc. It holds **no internal wall-clock timers**.

- The **React renderer** runs a clock (rAF) and calls `getStateAt(now)` each tick.
- The **Remotion renderer** calls `getStateAt(frame / fps * 1000)` per frame.

Because both ask the same pure function for the same timestamp, **the live preview and the exported video are guaranteed identical, frame for frame.** This determinism is the load-bearing constraint of the whole system — every feature must preserve it (no `Math.random()` without a seeded RNG, no `Date.now()` inside the engine, no layout that depends on async measurement to advance the timeline).

> ⚠️ **Determinism is timing-only by default.** `getStateAt` is deterministic, but *visual* frame parity also depends on text layout — font metrics, fallback fonts, emoji rasterization, and line-wrap all vary by OS/browser/container. Pixel-identical output across environments requires the runtime lockdown in **§19**; without it, parity holds within an environment but can drift across them.

---

## 4. Package architecture

A pnpm + Turborepo monorepo. Published packages are scoped `@typecaast/*`.

```
typecaast/
├── packages/
│   ├── core/              # @typecaast/core   — framework-agnostic engine (no DOM)
│   ├── react/             # @typecaast/react  — <Typecaast>, hooks, real-time player
│   ├── remotion/          # @typecaast/remotion — compositions + render CLI
│   ├── skins/             # @typecaast/skins  — built-in presets (or split per skin)
│   ├── skin-kit/          # @typecaast/skin-kit — defineSkin types, capability/theme helpers,
│   │                      #   create-typecaast-skin scaffold, Storybook + regression template
│   ├── capture/           # @typecaast/capture — extension + saved-page importer → skin drafts
│   ├── builder/           # @typecaast/builder — embeddable visual editor (React)
│   ├── schema/            # @typecaast/schema — Zod schema, JSON Schema, TS types
│   └── cli/               # @typecaast/cli    — validate / render / scaffold-skin
├── apps/
│   └── site/              # Next.js app on Vercel (docs + playground + gallery)  [not published]
├── examples/              # runnable example configs + embeds (incl. the Slack billing-toast demo)
├── extension/             # Chrome extension source (MV3)  [not published to npm]
├── .changeset/
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

### Dependency graph
`schema` ← `core` ← {`react`, `remotion`} ← `skins`. `builder` depends on `react` + `schema`. `capture`/`extension` emit drafts consumed by `skins`/`cli`. `site` depends on `builder`, `react`, `skins`, `remotion`.

### Why this split
- **`core` has zero UI dependencies** so it's testable in isolation and reusable anywhere (even a future Vue/Svelte binding).
- **`schema` is separate** so the builder, CLI, docs, and runtime all validate against one source of truth and generate types from it.
- **Skins are reused verbatim** by `react` and `remotion` — the only difference is what drives the clock.
- **License tiers map to the package split (§17):** runtime/SDK + skins + skin-kit + cli + capture-lib are **Apache-2.0**; `builder` + `apps/site` are **FSL-1.1-Apache-2.0**; the `typecaast-cloud` service lives in a **separate private repo**. Each package carries its own `LICENSE`; a root `LICENSING.md` shows the table.

---

## 5. The engine (`@typecaast/core`)

### Two-stage pipeline

1. **Compile** (`compile(config) → CompiledTimeline`): pure, memoized. Resolves the authored, auto-paced steps into an **absolute timeline** of timed events with computed `startMs`/`endMs`. This is where WPM → typing duration, inter-message gaps, reaction delays, and humanizing jitter (seeded) are baked in. Overrides win over computed values.
2. **Sample** (`getStateAt(t) → SimState`): pure. Walks the compiled timeline and returns the renderable state at `t`.

```ts
interface SimState {
  messages: RenderedMessage[];     // visible messages, each with reveal/typing progress (0..1)
  typingIndicators: TypingState[]; // "Paul is typing…" bubbles currently shown
  composer: ComposerState;         // text typed so far, caret position, send-in-progress
  scroll: { targetOffset: number; reason: 'new-message' | 'reaction' | 'none' };
  durationMs: number;              // total timeline length (drives video duration)
}
```

### Auto-pacing model (with overrides)
Global defaults, all overridable per step:

```ts
pacing: {
  readingWpm: 240,        // gap before an incoming message ≈ reading time of prior message
  typingCps: 14,          // chars/sec for composer + sender typing duration
  reactionDelayMs: 700,   // lag between a message and a reaction landing
  interMessageGapMs: 900, // baseline beat between messages
  humanize: 0.15,         // ±15% seeded jitter so it doesn't feel robotic (deterministic)
  startDelayMs: 400
}
```

Per-step overrides: `delay` (absolute or relative), `typingDuration`, `instant: true`, `showTypingFor`, `holdAfter`.

### Event/step types (v1)
`message` (incoming, optional preceding typing indicator) · `reaction` (attached to a message id) · `typing` (standalone indicator) · `composerType` (self types char-by-char in the input) · `send` (composer commits to thread) · `edit` · `delete` · `readReceipt` · `system` (e.g. "Pull request opened" app card) · `beat`/`wait` (explicit pause).

### Player API (consumed by renderers)
`play() · pause() · seek(t) · setRate(x) · on('tick'|'end') · state` — plus `loop`. The player is a thin clock wrapper around `getStateAt`; renderers can also drive sampling directly (Remotion does).

### Determinism guards
Seeded RNG (seed in config) for all jitter; no `Date.now()`/`performance.now()` inside compile/sample; a unit test asserts `getStateAt(t)` is referentially stable across calls and across React-vs-Remotion sampling.

---

## 6. Config schema (`@typecaast/schema`)

JSON, **versioned**, Zod-validated, with generated JSON Schema (for editor autocomplete) and TS types (`z.infer`). Designed to **round-trip** through the builder (import any valid config, edit, export).

```jsonc
{
  "version": 1,
  "meta": {
    "canvas": { "width": 880, "height": 720 },   // authoring reference; fixed for video
    "fps": 30,
    "fit": "reflow",                              // "reflow" | "scale" | "fixed"
    "theme": "auto",                              // "light" | "dark" | "auto" (inherits page)
    "skin": { "id": "slack", "options": { "channel": "#alerts", "showThreadHeader": true } },
    "seed": 42,
    "background": "transparent",
    "assets": "inline"                            // "inline" (data URLs) | "url" (referenced)
  },
  "participants": [
    { "id": "cory", "name": "Cory Watilo", "avatar": "./cory.png", "isSelf": true },
    { "id": "paul", "name": "Paul D'Ambra", "avatar": "./paul.png", "color": "#5b3a8e" },
    { "id": "posthog-bot", "name": "PostHog", "kind": "app" }
  ],
  "pacing": { "readingWpm": 240, "typingCps": 14, "humanize": 0.15 },
  "timeline": [
    { "type": "message", "from": "cory", "text": "i got a billing toast error on the dashboard but i think it's a bug?" },
    { "type": "reaction", "target": "$prev", "emoji": "🦔", "delay": 1200 },
    { "type": "typing", "from": "paul", "showTypingFor": 1800 },
    { "type": "message", "from": "paul", "text": "@PostHog the billing/spend API call shouldn't show an error toast to the user…" },
    { "type": "message", "from": "cory", "text": "here's the toast:",
      "images": [{ "src": "./toast.png", "alt": "billing error toast", "width": 320 }] },
    { "type": "system", "from": "posthog-bot", "card": "pr-opened", "text": "Pull request opened.",
      "actions": [{ "label": "View PR" }, { "label": "Open in PostHog Code" }] },
    { "type": "composerType", "from": "cory", "text": "Let me check how exceptions are captured in the frontend." },
    { "type": "send" }
  ]
}
```

**Extensible content model.** Under the hood a message's body is a `ContentNode[]`, where each node has a `type` resolved through a **content-type registry**. v1 registers `text` (with inline `@mention`/`link`/`code`/`emoji` marks) and `image`. The convenience `text`/`images` fields above are sugar that compiles to nodes. Future types (`attachment`, `linkPreview`, `videoEmbed`, …) register without a schema-version bump; unknown types are validated leniently and skipped by skins that don't handle them. `$prev` / message ids let reactions and replies bind to targets.

**Assets (avatars + in-message images).** Resolution honors `meta.assets`: **`inline`** embeds images as data URLs (the default the generator/site uses — produces a fully self-contained config, ideal for shareable links and video) and **`url`** references hosted images (the option for embedded use, where the user keeps images in their own repo/CDN and ships a smaller config). The CLI/builder can convert a config between the two modes. In-message images use the same model; skins render them inside the bubble per the target UI's image treatment.

---

## 7. Skin contract

A skin is a typed set of presentational React components plus metadata. **Pure, SSR-safe** (no `window`-only access at module top level) so the same code renders in the browser and in Remotion's Node renderer.

```ts
export interface Skin {
  id: string;
  meta: {
    name: string;
    defaultCanvas: Size;
    supportsThemes: ThemeMode[];          // e.g. ['light','dark'] or ['dark'] for a TUI
    capabilities: Capabilities;            // what this skin supports & how it represents it
    optionsSchema?: ZodType;
  };
  components: {
    Frame: FC<FrameProps>;            // chrome: header, channel name, thread title
    Message: FC<MessageProps>;        // bubble/row; props incl. participant, richText, images[],
                                      //   isSelf, isGrouped, revealProgress, state, timestamp
    TypingIndicator: FC<TypingProps>;
    Reaction: FC<ReactionProps>;      // single reaction pill (emoji + count)
    Composer: FC<ComposerProps>;      // input area; renders typed text + caret + send affordance
    SystemMessage: FC<SystemProps>;   // app cards (e.g. "Pull request opened" + buttons)
    Avatar: FC<AvatarProps>;
  };
  tokens?: { light: SkinTokens; dark: SkinTokens }; // per-theme design tokens
}
```

```ts
export function defineSkin(skin: Skin): Skin; // helper for type-safety + registration
```

Every component receives the resolved `theme` (`'light' | 'dark'`) via context. **Pixel-perfect mandate:** presets must match the real app at the level of spacing, type, color, and the specific light/dark palettes — not a generic approximation. Captured template skins inherit fidelity from the source DOM by construction.

### Capability model (per-platform behavior)
Each skin declares a `capabilities` map so the engine knows what it can render and how:

```ts
interface Capabilities {
  events: Partial<Record<EventType, 'native' | 'fallback' | 'unsupported'>>;
  // e.g. typing: 'native' (Slack "X is typing…"), 'native' (iMessage dot bubble),
  //      or 'unsupported' → omitted entirely for skins with no such affordance
  content: Partial<Record<ContentNodeType, boolean>>; // image: true, videoEmbed: false …
  reactions: boolean;
  threads: boolean;
  readReceipts: boolean;
}
```

Resolution rules when the engine samples state: an event/content node the skin marks `unsupported` (or `false`) is **dropped from that skin's render** but kept in the config (so switching skins restores it). The builder surfaces these as non-blocking warnings ("iMessage skin will ignore the reaction on message #3"). The same typing event therefore yields a Slack label, a Messages dot-bubble, or nothing — driven entirely by the skin's declaration, not by branching in the engine.

The engine passes state; the skin decides layout. Animation primitives (fade/slide-in on reveal, typing dots, reaction pop) are provided as small shared helpers in `@typecaast/react` so skins stay declarative and both renderers animate identically (driven by `revealProgress`, not by CSS transitions that Remotion can't capture).

### Skin types
- **Component skins** — the built-in presets, hand-authored React.
- **Template skins** — produced by capture tooling: normalized HTML templates with named slots (`{{message}}`, `{{author}}`, `{{avatar}}`…) plus extracted CSS/tokens. A `TemplateSkinAdapter` implements the same `Skin` contract by filling slots, so the engine/renderers don't care which kind they got.

### Responsiveness & overflow
- `canvas` is the authoring reference (and the exact frame for video).
- `fit` modes: **`reflow`** (container queries + ResizeObserver; bubbles re-wrap naturally on small screens) · **`scale`** (CSS transform scale-to-fit, preserves exact layout) · **`fixed`** (clip to canvas).
- As the thread overflows, the engine emits a `scroll.targetOffset`; the renderer animates older messages upward and keeps the latest in view — matching the "content shifts up" behavior in the brief.

---

## 8. React renderer (`@typecaast/react`)

```tsx
import { Typecaast } from '@typecaast/react';
import { slack } from '@typecaast/skins';
import config from './billing-toast.json';

<Typecaast config={config} skin={slack} theme="auto" autoplay loop fit="reflow" rate={1} />
```

- `<Typecaast>` mounts the player, ticks via `requestAnimationFrame`, samples `getStateAt`, renders the skin.
- Hooks: `useTypecaast(config)` → `{ state, play, pause, seek, scrubTo(t), setRate, stepNext, stepPrev, duration, rate }` for custom controls — the builder uses this for **preview-as-you-go editing** (see §11).
- `theme="auto"` resolves against the host **OS/page** `prefers-color-scheme` (via `matchMedia`, reactive to changes); `light`/`dark` force a mode. **When no preference signal is available, falls back to `light`** (consistent with export default).
- Honors `prefers-reduced-motion`; optional built-in controls (play/scrub) toggleable.
- **Live, correct fonts:** the resolved skin loads its declared web fonts on mount (see §19) so a live preview matches the platform even outside video export.
- Lazy-loads skins/assets; SSR-friendly (renders first frame on server, hydrates the clock on client).

---

## 9. Video export (`@typecaast/remotion`)

- A `<TypecaastComposition config skin />` reads `useCurrentFrame()` + `useVideoConfig()`, computes `t = frame / fps * 1000`, calls `getStateAt(t)`, renders the **same skin components**.
- Composition `durationInFrames = ceil(state.durationMs / 1000 * fps)`; width/height from `meta.canvas`.
- **Output dimensions & presets.** Canvas size is editable at any time — including after a script exists — and the layout reflows live; changing it never invalidates the timeline. Built-in **aspect presets** (16:9 1920×1080, 1:1 1080×1080, 9:16 1080×1920 vertical, 4:5, plus custom W×H) and a **scale factor** (`1x`/`2x`/`3x` or an explicit target resolution) so the same config exports at retina/social sizes. Aspect changes are a `meta.canvas` edit, not a re-author.
- Render path: **local CLI** (`typecaast render config.json --format mp4|gif|webm --size 1080x1920 --scale 2 --transparent --theme dark`) wrapping `@remotion/renderer`. Video is **self-hosted** — users run it themselves from the OSS package.
- `theme` is a render flag. `auto` isn't meaningful for a fixed video file, so export resolves it to a concrete mode; **when unspecified, export defaults to `light`.** A single render produces one theme; rendering both light and dark = two renders.
- Transparent background supported (for overlaying on other footage). **No audio.**

> **Paid offering (planned, post-v1):** a hosted "render my video for me" service, billed via **Stripe**, **one-time per video** (not a subscription). The OSS path stays fully capable; the paid service is convenience (no local toolchain, managed `@remotion/lambda`).
> - **One free-ish re-export per purchase** for *minor* changes — same general script (tweak copy, timing, a swapped avatar), not a wholesale new conversation. A heuristic/diff guards "is this still basically the same video"; large structural changes count as a new purchase.
> - **Light + dark bundle:** exporting both color modes of the same video is offered at a small uplift over a single-mode render.
> - Architecturally: keep the renderer a clean, callable package so the same code backs the CLI and the future hosted endpoint; persist the purchased config so the allowed re-export can diff against it.

---

## 10. Capture tooling (`@typecaast/capture` + `extension/`) — both methods in v1

Goal: turn a real, possibly non-public UI into a **pixel-perfect template skin** by reusing the source's own markup and styles. Both paths feed one normalization pipeline. Because we keep the captured CSS rather than re-implementing it, fidelity is inherited from the source — capture is how we hit "pixel-perfect" for UIs we don't ship presets for. We capture both **light and dark** variants where the source exposes them (e.g. toggle theme, capture twice → `tokens.light`/`tokens.dark`).

- **Chrome extension (MV3):** user navigates to the target app, picks the thread container element, clicks *Capture*. The extension serializes the chosen DOM subtree + computed styles + referenced fonts/images, then runs a **distiller**: prunes irrelevant nodes, collapses repeated message rows into a single slotted template, extracts color/spacing tokens, and emits a `SkinDraft` (HTML template + scoped CSS + tokens + slot map).
- **Saved-page import:** a CLI/web tool ingests `.html`/`.mhtml`, inlines and scopes styles, and runs the **same distiller** → `SkinDraft`.
- **Draft → skin:** `typecaast scaffold-skin draft.json` generates a `template` skin package the user edits (mark which node is the message, the author, the avatar, the composer). Docs cover the manual cleanup step.

> ⚠️ **Reality check (the plan's biggest risk):** keeping the source's own CSS gets us fidelity, but the hard parts are (1) **isolating the right subtree** and the repeating message row to slot-ify, (2) **scoping styles** so they don't leak or get clobbered by the host page, and (3) marking the **dynamic regions** (message list, composer, typing area) that we animate while everything else stays inert. Expect a manual cleanup step per captured skin — capture gets you most of the way there, you confirm the slots. This is why §14 sequences capture **last** in v1 and treats it as the cut-line; the component skin API already covers custom UIs by hand.

**Capture quality bar (pass/fail for M5).** Capture is "good enough to ship" only when, across a fixture set of real pages: slot auto-detection ≥ 80% (message row, author, avatar, composer, timestamp identified without manual hinting); **zero style leakage** into or out of the host page (verified by rendering the captured skin on a hostile test page); and median **manual fix time ≤ 10 minutes** to a playable skin. Captures that can't clear the bar fall back to "draft only" with a clear warning rather than masquerading as finished skins.

### Template-skin security model (P0 — hard constraints)
Captured/imported HTML+CSS, and any third-party template skin, are **untrusted by default** and a potential XSS/injection vector. This is not "normalize/distill" hand-waving — it's enforced:

- **Sanitize on capture/import** with an allowlist (e.g. DOMPurify-class): permit only safe structural tags + a fixed attribute allowlist; **strip all `<script>`, `<iframe>`/`<object>`/`<embed>`, `on*` event handlers, `javascript:`/`data:`(non-image) URLs, `<style>`/`<link>` that pull remote code, and CSS hazards** (`expression()`, `url()` to untrusted origins, `@import`). External resource loads are blocked or inlined.
- **Sandboxed rendering.** Template skins render inside an isolated boundary — **shadow DOM** for style scoping plus, where untrusted content is shown (gallery previews, imported drafts), a **sandboxed `<iframe>`** (`sandbox` without `allow-scripts`) so even a hostile template can't touch the host page, cookies, or storage.
- **CSP.** The builder/site ship a strict Content-Security-Policy (no inline scripts beyond hashed app bundles; constrained `img-src`/`font-src`/`style-src`); template skins can't introduce script execution.
- **Hostile fixtures in CI.** A test corpus of malicious captures (script injection, CSS exfiltration, event-handler payloads, SSRF-y URLs) must render inert; any escape fails the build.
- **Untrusted-skin labeling** ties to §17: installing/importing a third-party skin surfaces a trust prompt.
- **Defense-in-depth, no rolling our own.** Use a **maintained, audited sanitizer** (DOMPurify-class) — never a hand-rolled regex stripper — *plus* the iframe/CSP isolation, so a sanitizer miss still can't execute. A **third-party security review / pentest of the capture+template path is a hard gate before any public launch** (added to §25), and `SECURITY.md` invites disclosure. Treat "no holes" as continuously verified (dependency updates, fuzzed hostile fixtures), not a one-time checkbox.

---

## 11. Builder (`@typecaast/builder`) & hosted site (`apps/site`)

### Builder (embeddable React app)
- **Three-column layout.** Left = a tabbed inspector (`App | Timeline | Participants`) with `Import` pinned to the right of the tab bar. Center = the live preview with a transport bar (Restart · Prev · Play/Pause · Next · scrub) and zoom controls (Fit / Responsive / explicit %). Right = stacked **Options** and **Export** sections, separated by Figma-style section headers — no second tab bar.
- **App tab.** Skin picker + an auto-generated options form (driven by the skin's `optionsSchema`), composer-visibility toggle (Auto / Always / Hidden), a **Supported features** checklist (themes + capabilities the skin renders, with a `(fallback)` suffix for ones it stands in for generically), and a **Won't render in this skin** warning panel that lists every step the active skin would drop.
- **Timeline tab — preview-as-you-go editing.** Drag-reorderable rows with two-line previews (icon + type + content snippet) and inline `+ Step` insert zones between rows. The live preview is the primary editing surface, not a passive output: play/pause/scrub, step frame-by-frame, loop a selected range, and **adjust timing/pacing inline** — drag a message's delay or typing duration and see it immediately, tweak global WPM/CPS with a live re-pace, nudge a reaction's lag, all without re-rendering from scratch. Editing while playing is supported (seek stays put as you change values).
- **Capability-aware UI throughout.** The step picker greys out unsupported types with a tooltip explaining why; the Type select inside the step editor disables those same options; rows whose type isn't supported by the active skin show a ⚠ chip; the step editor surfaces a "drop" warning above the form when the current type would be skipped at render time. So config never silently mangles when you switch skins — the conflicts are visible at every level.
- **Participants tab** (renamed from "Cast"): name, id, color, kind (person/app), avatar (file → inlined data URL or pasted URL → kept as a link), and a single-select **viewer** radio.
- **Options section** (right column): canvas presets (16:9 / 1:1 / 9:16 / 4:5 / Slack / Phone / custom), width/height, fit (Responsive / Scale / Fixed), FPS, seed, background, loop. **FPS** is disabled (with an explanatory tooltip) when the export mode is **Code**; **Loop** is disabled when the export mode is **Video** — neither setting applies to the other path. Plus a Pacing block with reading WPM, typing CPS, and a humanize slider.
- **Export section** (right column): a `Code | Video` segmented control, an Assets dropdown (inline self-contained vs. URL referenced; disabled in Video mode since renders bake everything in), and:
  - **Code path** — three numbered steps: ① Install (npm/yarn/pnpm tabs), ② Embed snippet, ③ Content. Every code block has a pinned `⧉` copy icon in the top-right corner. The Content step shows a truncated, fading JSON preview that expands on click, with a `⬇ Download typecaast.json` button below.
  - **Video path** — the `typecaast render …` CLI snippet (no hosted video in v1); a "Render for me" entry point reserved for the future paid service.
- **Theme toggle** (light/dark/auto) in the preview so you can check both palettes.
- **Import.** Paste-or-load a JSON config from a modal opened via the `Import (ⓘ)` button on the Timeline column header; round-trips with the export.
- State persisted to URL (shareable links) and localStorage. The config keeps everything across skin switches; capability awareness only affects the *render*, not the source data.

### Design language & visual identity
This is a **designer's** tool and the public face of the project — it must look intentionally designed, on par with **Vercel / PlanetScale / Scalar**: sharp, confident, restrained. Explicitly **not** stock/AI-slop UI (no default shadcn-card-soup, no generic gradient hero, no Inter-on-grey nothing-pages).

- **Custom design system, not off-the-shelf.** A small bespoke token set (type scale, spacing, radius, motion) and purpose-built components; Tailwind/Radix-primitives acceptable as *plumbing*, but the visual layer is hand-designed, not theme-default.
- **Distinct identity:** considered typography (a real display/text pairing), a tight monochrome-plus-one-accent palette, crisp 1px borders over heavy shadows, dark mode as a first-class design (not an inverted afterthought), and meaningful, fast micro-motion.
- **The product demonstrates itself** — the marketing site uses Typecaast to show Typecaast (live simulations as hero content). Dogfooding is the best proof.
- **Quality bar gate:** the site/builder ship only when they'd pass as intentionally designed in a Typecaast design review — this is a named acceptance criterion in M4, not a "polish later" item.

### Hosted site (Next.js on Vercel)
Landing page · **MDX docs** (concepts, schema reference, skin authoring guide, capture guide) · **playground** (= builder, UI/embed generation only) · **preset gallery** with live light/dark demos · examples (incl. the Slack billing-toast thread from the brief) · contribution guide. Per-PR preview deploys. **Video rendering is intentionally not hosted in v1** (it's the seam where a paid per-video offering will later plug in via `@remotion/lambda`).

---

## 12. v1 presets

| Skin | Notes |
|---|---|
| **Slack thread** *(required)* | Matches the reference screenshot: thread header, avatars, app messages with action buttons ("View PR"), reaction pills, "N replies" divider, composer. |
| **Claude Code (TUI)** | Terminal UI preset. Monospace, ANSI palette, prompt/spinner/streaming-output treatment. Dark-first. |
| **Cursor panel** | Cursor-style AI side panel (covers the "MCP in Cursor" surface). |
| **iMessage (iOS)** | iPhone Messages: full-bleed bubbles, top contact bar, on-screen keyboard, status bar. Distinct skin from macOS. |
| **Messages (macOS)** | Desktop Messages: sidebar conversation list, window chrome, wider layout. Shares bubble styling tokens with iOS but a different `Frame`. |
| **WhatsApp** | Green accent, double-tick receipts, timestamps. |
| **Discord / Telegram** | Channel layout, role colors, grouped messages. |
| **PostHog** *(post-capture)* | **Not hand-authored.** You'll capture the current PostHog AI chat UI with our Chrome extension (it's changed recently), then we promote that captured skin into a built-in. Lands once M5 capture exists. |

Each preset ships in **both light and dark** (except where the real app is single-mode, e.g. the TUI), with an example config and a Storybook entry.

**Build from real references, not guesses.** Popular platforms have abundant public reference material; presets are built to match real screenshots/spec per skin per theme, and gated by visual regression against those references. PostHog is the deliberate exception — captured live via our own tool.

### Community skin library + AI authoring skill
The point of the skin contract is that *anyone* can add a platform. To make that real:
- **`@typecaast/skin-kit`** — scaffolding (`create-typecaast-skin`), the `defineSkin` types, capability/theme helpers, and a Storybook harness with a visual-regression template.
- **Extensive authoring docs** — a "Build a skin" guide covering the contract, capability declarations, light/dark tokens, the pixel-perfect bar, and how to submit a skin to the community registry.
- **An AI skill (`skill: create-skin`)** — a packaged skill that walks a user from a reference screenshot or a captured draft to a working, theme-aware skin: infers tokens, scaffolds components, declares capabilities, and wires up the regression snapshot. Documented prominently in the README so contributors can spin up a new platform skin in minutes.
- A **community registry / gallery** so submitted skins are discoverable and installable, growing the preset library over time.

---

## 13. Tooling, testing & CI

- **Lang/build:** TypeScript strict; tsup → dual ESM+CJS + `.d.ts`; Turborepo task graph + remote cache.
- **Lint/format:** ESLint + Prettier; `tsc --noEmit` typecheck gate.
- **Unit:** Vitest — engine determinism, auto-pacing math, schema validation, override resolution, **capability resolution** (unsupported events/content dropped per-skin but retained in config).
- **Frame-parity test (critical):** assert React-sampled state at `t` deep-equals Remotion-sampled state at the matching frame for a corpus of configs.
- **Visual:** Storybook per skin + Playwright/Chromatic snapshot regression, **light and dark**, gated against real reference screenshots (the pixel-perfect bar).
- **Security:** hostile-fixture suite for template skins (script/CSS/handler injection must render inert — §10); sanitizer + CSP regression tests.
- **E2E:** Playwright over the builder (import → edit → export JSON → re-import equality).
- **Render smoke test:** CI renders a short config to MP4 to catch Remotion breakage.
- **CI/CD:** GitHub Actions (lint, typecheck, test, build, visual); **Changesets** → automated npm publish + changelog; Vercel preview deploys for `apps/site`.
- **DX:** seeded fixtures, a `create-typecaast` starter, and the example configs double as test inputs.

---

## 14. Milestones (ship in slices, even though v1 = everything)

Sequenced so each milestone is independently demoable and the riskiest work (capture) is last and cuttable.

### Build approach: UI-first (validate before wiring logic)
**Build the visible product first, against placeholder data — then back it with real logic.** Rather than implementing the engine, then hoping the UI needs match, we build the **skins, the player UI, and the builder shell against a hand-mocked `SimState` and a faked/scripted playback**, get them feeling right, and let *that* reveal what the engine and config schema actually need. Only once the UI is solid do we replace the mocks with the real `compile` / `getStateAt` implementation. This is faster (no rework from building slightly-wrong functions), and it suits a design-led project — the interface is the spec.

This works *because* of the architecture (§3): the renderer is a pure consumer of `SimState`, so a mocked `SimState` and a stub player are drop-in stand-ins for the real engine. The contract (the shape of `SimState` + the skin props) is the one thing we lock early (M0); everything visual is built on top of it with fakes; the engine is slotted in underneath without touching the UI. **Concretely, this splits M1 into M1-UI (mocked) → validate → M1-engine (real).** Same pattern applies wherever useful (builder controls before the logic they drive).

- **M0 — Foundations + contracts:** monorepo, schema + Zod + JSON Schema/types (incl. `theme`, `assets`, content-node registry, in-message `images`), **the `SimState` + skin-prop type contracts**, plus mock-state fixtures, CI, Changesets. *Exit:* `typecaast validate` works on a config; mock `SimState` fixtures exist for UI work.
- **M1-UI — Skins + player UI + builder shell on mocked data:** build the Slack skin, the `<Typecaast>` renderer wired to a **stub player over mocked `SimState`**, theme switching, reflow/scroll, and a first builder shell with real controls driving the mock — all *without* the engine. *Exit:* the billing-toast thread looks and feels right (light + dark) playing from faked state; **scope of what the engine/schema must produce is confirmed.** ← validation gate.
- **M1-engine — Real engine behind the validated UI:** implement `core` (`compile` + `getStateAt`), content-node model, **capability resolution**, auto-pacing + overrides, the real player; swap the mocks out. UI shouldn't need to change. *Exit:* the billing-toast demo plays from a real config in light **and** dark. **← this is the true MVP.**
- **M2 — Remotion export (self-hosted):** composition + CLI render, frame-parity test, transparent bg, `--theme` flag (defaults `light`). *Exit:* same demo renders to MP4/GIF locally. Keep renderer as a clean callable package (future paid-service seam).
- **M3a — Flagship skins + skin-kit beta:** Slack is already done; add **2–3 flagship skins** (Claude Code TUI, iMessage iOS, +1) to pressure-test the contract, plus a **beta `@typecaast/skin-kit`** and the skin-authoring docs. *Exit:* a third party can author a skin from docs alone.
- **M3b — Remaining presets + ecosystem:** Cursor panel, Messages (macOS), WhatsApp, Discord/Telegram, each light+dark (where applicable) built from real references + visual regression. Ship **`create-typecaast-skin`**, the **AI authoring skill**, and the community registry.
- **M4 — Builder + site (UI/embed only):** builder package, Next.js site on Vercel (docs + playground + gallery + theme toggle + capability/lint warnings, a11y-conformant — see §20). **No hosted video.** *Exit:* public generator producing embeds + self-contained (data-URL) configs.
- **M5 — Capture (extension + saved-page):** scoping/distiller pipeline, MV3 extension, importer, `scaffold-skin`, template-skin adapter, light/dark double-capture, docs. Must meet the **capture quality bar (§10)**. *Exit:* capture a page → confirm slots → play. **Then capture PostHog's AI chat and promote it to a built-in skin.** **← cut-line if time-constrained; everything above still ships.**
- **Future (post-v1) — Paid render service:** managed `@remotion/lambda` behind a Stripe one-time **per-video** purchase (one minor re-export; light+dark bundle), wrapping the M2 renderer package. Out of v1 scope; M2/M4 are built so it slots in without rework.

A **v1.0 release** = M0–M5. If M5 slips, ship **v0.9** (M0–M4) — fully functional with hand-authored custom skins — and follow with capture.

---

## 15. Risks & mitigations

- **Capture: slotting & style scoping (highest):** keeping source CSS gives fidelity, but isolating the message row, scoping styles, and marking dynamic regions is fiddly. → Manual confirm step per skin; sequence last (M5); component API covers custom UIs regardless.
- **Pixel-perfect bar for presets:** "looks close" isn't the goal. → Visual-regression snapshots (light+dark) against reference captures gate each preset; treat the real app screenshot as ground truth.
- **React/Remotion drift:** the two renderers diverge. → Enforced by the pure-function rule + automated frame-parity test; shared skin code.
- **Animation in Remotion:** CSS transitions/JS timers aren't frame-captured. → Drive all motion from engine-provided progress values (`revealProgress`), never from CSS transition timing.
- **Theme correctness:** captured/preset dark palettes must be exact, and `auto` must react to page changes. → Per-theme token sets; `matchMedia` listener; both palettes in visual regression.
- **Scope (everything in v1):** four big surfaces at once. → Milestones with a clear cut-line (M5) and a shippable v0.9.
- **Wrong/missing fonts (live + video):** the typeface is most of the fidelity, and proprietary fonts (SF Pro) can't ship. → Per-skin declared font stacks loaded as web fonts in live preview *and* export, with documented OFL substitutes (Lato, Inter…); never rely on host OS fonts (§19).
- **Skin API churn:** early contract changes break presets. → Stabilize the `Skin` interface (incl. theming + capabilities + fonts) in M1 against the Slack preset before building M3 skins.
- **Design quality (P0 for trust):** a stock/AI-slop UI undercuts a designer-led, fidelity-focused tool. → Bespoke design system + named design-review gate in M4; dogfood the product on its own site (§11).
- **Legal/IP (P0):** pixel-perfect replicas touch trademark/trade-dress; bundled marks/fonts add license risk. → Brand policy + no bundled marks/proprietary fonts + disclaimers + takedown process (§17); lawyer review before launch.
- **Cross-environment frame drift (P0):** fonts/emoji/line-wrap vary by runtime. → Runtime lockdown: pinned fonts/container/emoji + layout-parity tests (§19).
- **License perception:** any "open source" label on the non-OSS parts invites HN backlash. → **Open-core** with one consistent wording: runtime = Apache (OSS), builder = FSL (source-available); per-package badges + `LICENSING.md`; never call the whole project "open source" (§17).
- **Template-skin XSS/injection (P0):** captured/third-party HTML+CSS can execute code. → Allowlist sanitize on capture/import, shadow-DOM + sandboxed-iframe rendering, strict CSP, hostile fixtures in CI (§10).
- **SSRF via server render (P0, cloud):** `assets:url` + server fetch hits internal/metadata endpoints. → Block private/metadata IPs (resolve-then-validate), https+image-only allowlist, size/time limits, restricted worker egress (§24).
- **Secret leakage in public repo:** keys committed by accident. → Secrets in CI/host env only, `.env.example`, GitHub secret scanning + push protection + gitleaks; commercial service in a private repo (§29).
- **Telemetry creep into packages / content captured without consent:** analytics added to an embeddable package, or authored content sent when a user opted out. → CI guard test (runtime/CLI import no analytics SDK); consent-keyed content-field gate obfuscates content client-side by default; masking follows the same switch (§27).

---

## 16. Open questions (to resolve before/while building)

Nothing blocking remains. Decisions captured below.

*Resolved:* **name → Typecaast**; content types (image only, extensible registry); per-platform rendering (capability model); separate iOS/macOS Messages skins; presets built from real references; PostHog via capture; Stripe + per-video + light/dark bundle; **theme `auto` inherits OS, falls back to `light`**; **export defaults to `light`**; **community registry = GitHub-based gallery** (revisit only if template volume grows); **re-export boundary = % of nodes changed**, a tunable threshold we can adjust later; **no redaction layer** (user authors only what they want shown); **per-platform fonts** (Lato for Slack, Inter as the SF Pro substitute, etc.) loaded live and in export; **resizable output** (aspect presets + scale, editable mid-script); **preview-as-you-go** editing; **bespoke, design-reviewed UI** (no stock/AI-slop).

---

## 17. Legal & brand policy

> **Not legal advice.** This sets the project's default posture; a lawyer should review the trademark/trade-dress position before any public launch and before shipping any vendor-branded preset.

Rendering recognizable third-party UIs raises trademark, trade-dress, and platform-terms questions. The posture:

- **Positioning language.** Typecaast is an independent, unaffiliated tool. Presets are described as *"<Platform>-style"* / *"inspired by"*, never "official" or endorsed. A standing disclaimer ("trademarks belong to their owners; Typecaast is not affiliated with or endorsed by them") appears in README, docs, and the site footer.
- **No bundled proprietary marks by default.** Built-in skins reproduce *layout, typography, spacing, and color* (trade dress) but do **not** ship third-party **logos, brand icons, or proprietary/licensed fonts** in the repo. Those are referenced as user-supplied assets or substituted with neutral placeholders; the skin documents what the user must provide.
- **Built-in vs community tiers.** Built-in skins are vetted against this policy. Community skins go through a submission checklist (no bundled marks/fonts, correct naming, provenance declared) before listing; the registry can delist non-compliant skins.
- **Capture is user-driven and user-owned.** The extension/import tools capture whatever the *user* points them at; responsibility for rights to captured UIs rests with the user. The tools surface this in-product (a one-time acknowledgement) and never auto-publish captures.
- **Reference screenshots (tests/docs).** Ground-truth screenshots used for visual regression and docs carry documented provenance and are used under fair-use/nominative-use for interoperability/testing — kept minimal, not redistributed as standalone assets, and excluded from published npm packages (test-only). Fonts used in tests are open-licensed or the bundled pinned set (§19).
- **Takedown process.** A documented contact + `TRADEMARKS.md` / takedown policy with a target response window, and a fast path to delist a built-in or community skin on a valid complaint.
- **PostHog skin.** Shipped with PostHog's awareness/blessing as the marketing hook; treated as the reference example of a "blessed" branded skin.

### License — open-core (three tiers)
**Goal:** maximize adoption of the runtime *and* protect the monetizable product, while being scrupulously honest about what's OSS. A single blanket non-compete license would chill the community-skin flywheel; plain MIT everywhere would leave the product unprotected. Open-core resolves both:

| Tier | Packages | License | Why |
|---|---|---|---|
| **Runtime / SDK** | `core`, `schema`, `react`, `remotion`, `skins`, `skin-kit`, `cli`, `capture` (lib) | **Apache-2.0** (true OSS, OSI) | These are the things people import/embed and the basis for community skins. Adoption > protection here; Apache adds a patent grant over MIT. |
| **Product surface** | `@typecaast/builder`, `apps/site` | **FSL-1.1-Apache-2.0** (source-available, non-compete) | The differentiated UX. Free to use/self-host/modify, **not** to launch a competing generator; **auto-converts to Apache-2.0 after 2 years**. |
| **Commercial** | `typecaast-cloud` render service | **Proprietary / private** | Never published; the paid layer (§29). |

- **What "competing" means** is spelled out in the FSL `LICENSE` + a short plain-English `LICENSING.md` (you may build products *with* Typecaast; you may not offer Typecaast-the-generator/render-service as a product). A competitor *can* fork the Apache runtime — that's intentional; the moat is the builder UX, capture tooling, hosted service, and brand, not the rendering primitives.
- **Consistent wording everywhere.** Use exactly: *"Runtime: Apache-2.0 (open source). Builder: FSL-1.1-Apache-2.0 (source-available)."* Never describe the **whole project** as "open source." A per-package license badge + a top-level `LICENSING.md` table prevent the label mismatch HN punishes.
- **Alternatives considered for the product tier:** BSL 1.1 (per-release change date) and PolyForm Shield (no time conversion). FSL chosen for brevity + guaranteed eventual OSS conversion.
- **CLA/inbound.** Contributions to FSL-licensed packages come in under a lightweight **CLA** (inbound=outbound) so relicensing rights are retained for the Apache conversion; Apache-tier packages can take DCO. (§23)
- **Trademark ≠ license.** The Typecaast **name/logo** are protected regardless of code license — a fork may use the code under its tier's terms but not the brand.

> **Not legal advice** — confirm the tiers + FSL instrument with a lawyer before launch.

### Community skins are untrusted code
A skin is executable code/markup. Built-in skins are first-party and vetted; **community/third-party skins and captured templates are untrusted** and must be treated as such:

- Stated plainly in docs and at install/import time ("third-party skins run code — only use ones you trust"); the registry is a directory, **not** an endorsement.
- Template (captured) skins are sandboxed and sanitized at runtime (§10 security model) regardless of source.
- **Built-in skin approval checklist + named owner** per skin; community submissions pass the same checklist (no bundled marks/proprietary fonts, correct "-style" naming, provenance, clean sample content) before listing.
- **Takedown SLA:** documented contact, target first-response window (e.g. 72h), and a fast path to delist any built-in or community skin on a valid trademark/IP complaint.
- **Official vs community is visually distinct** in the gallery (badge), so users never mistake a community skin for first-party.

## 18. Privacy posture

**The output is public by design — so there is no automated content-redaction layer.** A simulation exists to become a public video/embed; the user authors exactly what they want shown. Typecaast does **not** scan/OCR/auto-redact message text or assets — that would be friction for content meant to be published. What we *do* add is lightweight **capture-hygiene rails**, because the one place a user can leak something unintentionally is capturing a real app's DOM, which may contain more than what's visible on screen:

- **Capture is scoped to the visible, selected subtree.** The distiller keeps the chosen message UI and drops off-screen/hidden DOM, `data-*` payloads, and resource references it doesn't need — so a capture doesn't silently carry hidden fields, tooltips, or adjacent threads.
- **One-time pre-share notice.** The first time a user creates a share link or copies an embed from a *captured* skin, a non-blocking banner reminds them: "Captured UIs and inline images may contain more than what's visible — review before publishing." Acknowledged once, not policed every time.
- **Safer share defaults.** Share links/embeds are generated only from config the user explicitly exports; captured drafts aren't auto-published anywhere; the extension is **local-first** (no server transmission in v1).
- **Documented, not enforced:** docs note that **inline data URLs embed the actual image bytes** into the config (a config is as shareable as the images in it).
- **Registry submissions** must use placeholder/sample content (no real customer data) — a public-contribution guideline, not a runtime scanner.

## 19. Fonts, determinism & runtime lockdown

### Per-platform fonts (live preview *and* export)
Getting the typeface right is most of what sells "pixel-perfect." Every skin declares its fonts explicitly, and **live rendering loads the correct web font** — not just the video export. Resolution rules:

- **Use the real font where it's openly licensable.** Slack → **Lato** (OFL, bundleable). Discord → its UI stack (gg sans isn't redistributable → close open substitute, documented per skin). WhatsApp/Telegram → their respective stacks or substitutes.
- **Use the closest cross-platform substitute where the real font can't ship.** iMessage/Messages use **SF Pro**, which is Apple-licensed and unavailable on Windows/Linux → skins use **Inter** (OFL) as the documented stand-in. The skin records both the *intended* font and the *shipped* substitute so the choice is transparent and swappable (a user on macOS can opt into the system SF if they want).
- **Declared stack, not silent OS fallback.** Each skin ships a `fonts` declaration (family, weights, source = bundled OFL file or self-host URL) loaded via `FontFace`/`@font-face` on mount. The renderer **never relies on the host OS having a font** — it loads the declared one or errors, so a Slack sim looks like Slack on Windows, Mac, and in video alike.
- **Licensing ties to §17:** only open-licensed fonts (OFL etc.) are bundled in the repo; proprietary fonts are referenced/substituted, never redistributed.

| Skin | Intended font | Shipped (live + export) |
|---|---|---|
| Slack | Lato | Lato (OFL) |
| iMessage / Messages | SF Pro | **Inter** (OFL) |
| Claude Code (TUI) | terminal mono | a bundled mono (e.g. JetBrains Mono / IBM Plex Mono, OFL) |
| Cursor | UI sans | Inter (OFL) |
| WhatsApp / Discord / Telegram | platform stacks | documented OFL substitutes per skin |

### Determinism & runtime lockdown
To make frame parity hold *across* environments (not just within one):

- **Fonts pinned & bundled.** The declared per-skin fonts above are pinned (version + integrity-hashed); the renderer refuses to fall back silently — a missing declared font is a hard error, not an arbitrary substitution.
- **Fixed render environment.** Video export runs in a pinned container image (pinned Chromium/Remotion/Node, pinned font set, pinned emoji font e.g. a specific Noto Color Emoji version). The CLI documents this image; the future paid service uses the same one.
- **Emoji policy.** One emoji font is the source of truth across web preview and video so 🦔 etc. rasterize identically; documented, and part of the parity test. (Per-platform emoji styling — e.g. Apple vs Google emoji — is a per-skin option layered on top.)
- **Deterministic text-layout tests.** Beyond the state-parity test, a **layout-parity** suite renders a typography corpus (wrapping, long tokens, mixed scripts, emoji clusters) and diffs measured line breaks/metrics across the supported matrix; drift fails CI.
- **Seeded everything.** Single `seed` in config drives all jitter; RNG implementation is pinned (no `Math.random`).

## 20. Accessibility & internationalization

**Accessibility (builder + player + embeds).**

- Builder UI targets **WCAG 2.2 AA**: full keyboard navigation, focus management, screen-reader labels on timeline/track controls, AA contrast.
- The player/embed exposes an accessible **transcript** of the conversation (the config is already structured text) and proper roles/labels; honors `prefers-reduced-motion` (snap to final state, no typing animation).
- Generated embeds ship with sensible `alt` text for images and a non-animated fallback.
- Acceptance criteria: automated axe checks in CI for builder + a representative embed; manual screen-reader smoke test before release.

**Internationalization.**

- **RTL** support (Arabic/Hebrew) — skins must handle direction; bubble alignment and composer flip correctly.
- **CJK** line-wrapping, **mixed-script** runs, **emoji ZWJ clusters**, and **long unbroken tokens** must not break layout or pacing math (auto-pacing measures grapheme clusters, not code units).
- An **i18n test corpus** is part of the layout-parity suite (§19); each preset is snapshot-tested against it in both themes.
- Typography fallback strategy documented per skin (which scripts a skin's pinned fonts actually cover).

## 21. Performance budgets & support matrix

**Budgets (enforced via benchmark fixtures in CI; regressions fail).**

- Preview: sustain **≥ 30 fps** (target 60) for a "typical" timeline of **≤ 150 messages**; supported ceiling **500 messages / ~5 min**.
- Initial embed JS (core + react + one skin, gzipped) target **≤ 80 KB**; skins lazy-loaded.
- Video render: budget **≤ ~2× realtime** per render at 1080p30 on the reference container; memory ceiling documented.
- Config size guidance: inline-asset configs can balloon — warn past a threshold (e.g. > 5 MB) and suggest `url` mode.

**Support matrix.**

- **Browsers:** last 2 versions of Chrome, Edge, Firefox, Safari (relies on `matchMedia`, `ResizeObserver`, container queries — all baseline in these).
- **Node:** current LTS + previous LTS for the CLI/build.
- **Remotion runtime:** the pinned container image from §19.
- Documented fallback behavior when a feature is unavailable (e.g. no container queries → `scale`/`fixed` fit instead of `reflow`).

## 22. Schema migration & compatibility

- **Migration codemods.** Each `vN → vN+1` ships a migration that upgrades configs in place (CLI: `typecaast migrate`); the loader auto-migrates older configs on read and warns.
- **Compatibility guarantees.** Within a major version, configs are forward-compatible; unknown future content-node types validate leniently and are skipped (§6), not rejected.
- **Unsupported-version behavior.** A config newer than the installed runtime fails with a clear "upgrade Typecaast" error and exit code (§23 taxonomy), never a silent misrender.
- **Deprecation window.** Deprecated fields keep working for at least one minor cycle with a warning before removal at the next major.
- **SemVer per package** + Changesets; the `@typecaast/schema` package version and the config `version` are documented as related but distinct.

## 23. Failure-mode UX, governance & security

**Error taxonomy.** Three tiers, consistent across CLI, builder, and runtime:

- **Hard errors** (block): invalid schema, missing pinned font, config version too new. Non-zero CLI exit codes (distinct per class); builder shows a blocking modal with remediation.
- **Warnings** (proceed, surfaced): capability mismatch (skin will drop an event/node), missing asset (renders a labeled placeholder), oversized inline config, unknown future node type. CLI exits 0 but prints; builder shows a **lint panel** with per-item fixes.
- **Silent/info:** auto-migration applied, theme resolved from `auto`.

Every message includes a code, the offending location (step/message id), and a remediation hint.

**OSS governance & security.**

- `SECURITY.md` with a private disclosure channel and target response window; advisories via GitHub.
- `CONTRIBUTING.md` with a **CLA** (inbound=outbound grant) — required because the source-available, time-converting license (§17) needs the project to retain relicensing rights for the eventual Apache conversion; `CODE_OF_CONDUCT.md` and `CODEOWNERS` for review ownership (core engine vs skins vs site).
- **Release channels:** `alpha` / `beta` / `latest` dist-tags; pre-1.0 is `0.x` with breaking changes allowed on minors, clearly noted.
- **Backward-compat commitment** stated per package (engine/schema strictest; skins may evolve faster).
- **Preset maintenance model.** Built-in skins have an owner and a stated reality: upstream UIs change, so presets are **best-effort, versioned snapshots** ("Slack skin, captured 2026-Q2"), not guaranteed current. Community skins carry a "last verified" date; the registry flags stale ones. This is a documented non-goal of *guaranteeing* perpetual accuracy.

## 24. Paid render service — operational seams (future, non-goal for v1)

Out of v1 scope, but flagged now so architecture seams are intentional: job **queueing & concurrency limits**, **abuse/rate controls**, **retry/idempotency** on render failures, **storage retention** policy for purchased videos + source configs (needed for the one allowed re-export diff), and **billing dispute/refund** handling via Stripe. The M2 renderer-as-callable-package + persisted purchased config are the seams that make this addable without rework.

**SSRF & egress hardening (P0 for the cloud, designed now).** Server-side rendering of a user-supplied config with `assets: "url"` lets a caller point the render worker at arbitrary URLs — a classic SSRF risk (cloud metadata endpoints, internal services). Constraints baked into the renderer contract from the start: **block private/loopback/link-local IP ranges and cloud metadata IPs** (resolve-then-validate to defeat DNS rebinding), **allowlist protocol (`https` only) and content types (image/* only)**, enforce **size + timeout limits** per fetched asset, and run render workers under a **restricted egress policy** (no access to the internal network/metadata). Configs that fetch remote assets are safest converted to `inline` before server render. The OSS local CLI renders on the user's own machine, so this is specifically a hosted-service requirement.

## 25. Pre-build checklist (must be explicit before coding M1+)

- [ ] Legal position for built-in skins + trademark/trade-dress usage reviewed (§17), incl. PostHog sign-off.
- [ ] License tiers confirmed — open-core: Apache runtime / FSL builder / private cloud; CLA in place; per-package `LICENSE` + `LICENSING.md`; one consistent wording (§17).
- [ ] Template-skin security model specced — audited sanitizer + shadow-DOM/iframe sandbox + CSP + hostile fixtures; **third-party security review/pentest of capture+template path before public launch** (§10).
- [ ] Analytics consent model specced — opt-in content sharing; default obfuscates content client-side; consent-keyed field gate (§27).
- [ ] Public/private split decided — paid service in a private `typecaast-cloud` repo; SSRF/egress constraints for any server render (§24); secrets-in-env policy + scanning enabled (§29).
- [ ] Analytics event taxonomy drafted (builder + purchase funnels); confirm zero telemetry in shipped packages (§27).
- [ ] Per-skin font map locked — intended font + OFL substitute + license per platform (§19); fonts loaded live and in export.
- [ ] Deterministic runtime locked: bundled fonts, pinned container, emoji policy (§19).
- [ ] Design system + visual identity defined; M4 design-review gate named (§11).
- [ ] Minimum browser/Node/Remotion support matrix agreed (§21).
- [ ] Schema migration/deprecation policy written (§22).
- [ ] Accessibility (WCAG 2.2 AA) + i18n acceptance tests defined (§20).
- [ ] Performance budgets + benchmark fixtures defined (§21).
- [ ] Preset maintenance/ownership model + "last verified" convention defined (§23).
- [ ] Error taxonomy + exit codes agreed (§23).

## 26. Build workflow — step-by-step, commit-by-commit

The implementation follows a **granular, checklist-driven** workflow tracked in **`BUILD-CHECKLIST.md`** (companion file). The working agreement for whoever (human or agent) builds this:

- **One step = one focused commit.** Each checklist item is a small, self-contained unit of work. Build it, make it pass (types + tests/lint where applicable), then commit with a conventional message referencing the step (e.g. `feat(core): compile() resolves absolute timeline [M1.3]`).
- **Update the checklist as you go.** Check the box in the same commit that completes the step, so the checklist and the repo never drift. The checklist is the source of truth for "where are we."
- **Each step is independently verifiable.** No "big bang" commits — if a step can't be demoed or tested on its own, it's too big; split it.
- **Milestone exit criteria are explicit checkboxes too** — a milestone isn't done until its exit demo (e.g. "billing-toast plays in light and dark") is checked.
- **UI before logic (§14).** Within a milestone, build the interface against mocked state first, validate it, then wire the real logic underneath. Lock the data contract early; fake everything above it; slot the engine in last. If wiring the real logic forces a UI change, that's a contract miss worth recording.
- **Don't skip ahead.** Steps are ordered to keep the tree buildable at every commit; respect dependencies — but note the order is **contract → UI-on-mocks → engine**, not engine-first.

`BUILD-CHECKLIST.md` breaks every milestone (M0–M5) into these individual steps with checkboxes; it's kept in the repo root and updated continuously.

## 27. Analytics & instrumentation (PostHog)

**Hard rule: analytics live on the hosted property only — never in the shipped packages.** The embeddable runtime (`@typecaast/core`, `react`, `skins`, `skin-kit`) and the CLI contain **zero telemetry**: no phone-home, no PostHog snippet, nothing that fires from a user's embed or local render. Instrumentation is confined to the **hosted site + builder** (and later the paid render service). This protects adopters and keeps embeds clean. (Optional, *opt-in, off by default* anonymous CLI usage stats could be considered post-v1, but not in v1.)

PostHog is the obvious fit (dogfooding aside, it's best-in-class here):

- **Website visits / product analytics.** Autocapture pageviews + key custom events across the marketing site, docs, and gallery.
- **Builder funnel (the core product loop):** `builder_opened`, `skin_selected`, `step_added`, `timeline_edited`, `pacing_adjusted`, `theme_toggled`, `output_size_changed`, `preview_played`, `config_imported`, `embed_copied`, `json_exported`, `render_snippet_copied`, `share_link_created`. Enough to see where people drop off between "opened" and "exported."
- **Purchase funnel (paid render service, when live):** `render_for_me_clicked` → `checkout_started` → `purchase_completed` → `render_delivered`, plus `reexport_used`. Tie revenue events to the originating builder session; reconcile against Stripe as source of truth (PostHog for funnels, Stripe for money).
- **Session recordings + heatmaps** on the builder to watch real editing sessions (with masking of any text inputs by default).
- **Feature flags / experiments** for builder UX and pricing/landing copy tests.
- **Content sharing is opt-in (default: obfuscated).** A clear banner/notice asks whether the user will share *the content of what they're building* (message text, config) to help improve Typecaast. Two modes:
  - **Opted out (default):** content is **obfuscated client-side before anything is sent** — no message body/text, no config JSON, no image bytes/data URLs, no captured DOM. We capture only *structural/behavioral* events (which skin, step count, output size, which action). The obfuscation happens at the source, not server-side.
  - **Opted in (explicit):** the user agrees to also send authored content (message text, config) for product improvement. Even then, raw image bytes / captured DOM are excluded by default and the grant is **revocable** at any time (revoking stops content collection going forward).
- **Enforced by an allowlisted event-property schema** + a content-field gate keyed to consent, not free-form `capture()` calls — so "opted out = no content" is a code guarantee, not a policy promise.
- **Session-recording masking follows the same switch.** Text inputs and content-editing surfaces (message editor, composer, preview canvas) are **masked by default**; unmasking only with content opt-in. Recording itself is consent-gated.
- **Transparent + auditable.** A public `ANALYTICS.md` documents every event and property, what the opt-in unlocks, the **data region** (EU or US, chosen deliberately), and **retention windows**; the consent state is visible and changeable in-product.
- **Implementation details:** load via a **reverse proxy** (e.g. `/ingest` through Next.js/Cloudflare) so analytics aren't blocked and stay first-party; **consent-aware** (respect a cookie banner + Do-Not-Track; gate recordings on consent); identify only pseudonymous IDs pre-purchase, link to customer on purchase.
- **PostHog config in code** where sensible (dashboards/insights as code, flags created via the PostHog MCP — §28), so the analytics setup is reproducible and reviewable.

## 28. Infrastructure & ops automation (MCP-driven)

Wherever a service exposes an MCP, **provision and configure it through the MCP** rather than clicking around consoles — faster, reproducible, and Cory doesn't do it by hand. Treat these as **operator tooling run from the build environment, not code in the repo.**

- **Vercel MCP** — create/link the `apps/site` project, set env vars, manage domains, preview deploys, production promotion.
- **Cloudflare MCP** — DNS for `typecaast.com`/`.dev`, the analytics reverse-proxy route, caching/SSL, and (later) any worker fronting the render service.
- **Stripe MCP** — create the per-video **product + prices** (single video, light+dark bundle), payment links/checkout config, and webhook endpoints for the future render service. (Money-moving stays gated: configuration via MCP, but no charging customers in v1.)
- **PostHog MCP** — create the project, feature flags, dashboards/insights, and the reverse-proxy-friendly setup as code.
- **GitHub** — repo, branch protection, Actions secrets, environments (via CLI/MCP as available).
- **Idempotent + documented.** Each provisioning action is captured as a short, re-runnable script/runbook in a (private) ops location (§29) so the environment can be rebuilt; no undocumented console-only state.
- **Guardrail:** automation provisions and configures; it never executes charges, transfers, or destructive prod actions without explicit confirmation.

## 29. Secrets & public-repo privacy

The repo is **public**; several things must stay private. Plan for this from commit zero.

- **What's secret vs publishable.** PostHog **project API key is publishable** (client-side by design) — fine to ship in the site build. **Secret:** PostHog *personal* API keys (MCP/admin), **Stripe secret + webhook signing keys**, Cloudflare/Vercel tokens, any render-service credentials. These **never** touch the repo.
- **Where secrets live.** Host/CI env only: **Vercel env vars**, **GitHub Actions secrets/environments**, local `.env` files that are git-ignored. Commit a `.env.example` with blank keys for onboarding.
- **Secret scanning.** Enable GitHub **push protection + secret scanning**; add a pre-commit hook (e.g. gitleaks) so nothing leaks even by accident.
- **Server-only code isolation.** The paid render service and Stripe webhook handlers (server-side, with secret keys) are structured so their secret-bearing logic is **not** required for anyone to run the OSS pieces. Two viable shapes, decide at M4: (a) keep them in the monorepo but strictly server-side (`apps/site/server`, never imported by client/packages), or (b) move the commercial service to a **separate private repo** that depends on the public packages. **Recommended: (b) a private `typecaast-cloud` repo** — cleanest separation of the monetizable surface, and it sidesteps shipping competing-service glue in a public tree.
- **Private ops runbooks.** The MCP provisioning scripts/runbooks (§28) and any infra config with identifiers live in the **private** ops repo, not the public one.
- **License reinforces it.** The non-compete license (§17) covers the *code*; keeping the cloud service private + secrets out of the tree covers the *operational moat*. Belt and suspenders.

---

*Next step: confirm the open-core license tiers (§17), clear the §25 pre-build checklist, then scaffold M0 per `BUILD-CHECKLIST.md` — monorepo + `@typecaast/schema` + CI — committing step by step. I can also drive the Vercel/Cloudflare/Stripe/PostHog MCP setup when you're ready.*
