# Typecaast — Build Checklist

Granular, commit-by-commit build plan. Companion to `chat-simulator-plan.md` (the design spec). This file lives in the repo root and is the **source of truth for progress**.

## Working agreement
- **One step = one focused commit.** Build it → make it pass (types + tests/lint) → commit → check the box **in the same commit**.
- Conventional commits referencing the step id, e.g. `feat(core): compile() resolves absolute timeline [M1.3]`.
- Keep the tree **buildable at every commit**. Respect dependency order (schema → core → renderers → skins → builder → site → capture).
- A step too big to test on its own is too big — split it.
- A milestone is done only when its **exit criteria** boxes are checked.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Phase 0 — Pre-build gates (§25 of spec) — must clear before M1
- [ ] G.1 Legal/trademark posture reviewed; PostHog sign-off (§17)
- [ ] G.2 **License tiers confirmed** — open-core: Apache runtime / FSL builder / private cloud; CLA; lawyer review (§17)
- [ ] G.3 Per-skin font map locked: intended font + OFL substitute + license (§19)
- [ ] G.4 Deterministic runtime defined: pinned container, fonts, emoji font (§19)
- [ ] G.5 Design system + visual identity direction agreed; M4 design-review gate named (§11)
- [ ] G.6 Support matrix (browsers/Node/Remotion) agreed (§21)
- [ ] G.7 Performance budgets + benchmark fixtures defined (§21)
- [ ] G.8 Error taxonomy + CLI exit codes agreed (§23)
- [ ] G.9 Public-vs-private split decided: paid service in private `typecaast-cloud` repo (§29)
- [ ] G.10 Analytics event taxonomy drafted (builder + purchase funnels) (§27)

---

## M0 — Foundations
*Exit: `typecaast validate <config>` runs green in CI.*

- [x] M0.1 Init repo (public): pnpm workspace + Turborepo + base tsconfig + ESLint/Prettier
- [x] M0.2 Add Changesets; configure release pipeline (dry-run)
- [x] M0.3 GitHub Actions: install → typecheck → lint → test → build matrix
- [x] M0.4 Repo hygiene: per-package `LICENSE` (**Apache-2.0** runtime/skins/skin-kit/cli/capture-lib; **FSL-1.1-Apache-2.0** builder/site) + root **`LICENSING.md`** table + per-package badges; README labeled accurately; **CONTRIBUTING + CLA**, CODE_OF_CONDUCT, CODEOWNERS, SECURITY.md, TRADEMARKS.md, `LICENSING.md`, `ANALYTICS.md` stub
- [ ] M0.4b Secrets hygiene: `.env.example`, `.gitignore` env files, GitHub **secret scanning + push protection**, gitleaks pre-commit hook (§29)
- [ ] M0.4c Provision repo/CI via GitHub MCP/CLI (branch protection, environments, Actions secrets placeholders) (§28)
- [ ] M0.5 `@typecaast/schema`: Zod schema for `meta` (canvas, fps, fit, theme, assets, seed), `participants`, `pacing`
- [ ] M0.6 `@typecaast/schema`: content-node registry + `ContentNode[]` (text marks + image); `text`/`images` sugar → nodes
- [ ] M0.7 `@typecaast/schema`: timeline step union (message, reaction, typing, composerType, send, edit, delete, readReceipt, system, beat)
- [ ] M0.8 `@typecaast/schema`: generate JSON Schema + export inferred TS types
- [ ] M0.9 **Contracts (lock early): `SimState` type** (messages w/ reveal progress, typing, composer, scroll, duration) + **skin-prop types** + **Player interface** — the surface the UI builds against
- [ ] M0.10 **Mock-state fixtures:** hand-authored `SimState` snapshots + a scripted/faked playback stub implementing the Player interface (no real engine) for UI work
- [ ] M0.11 `@typecaast/cli`: `validate` command with error taxonomy + exit codes
- [ ] M0.12 Example config: the Slack billing-toast thread (fixture used downstream)
- [ ] M0.E **Exit demo:** CI validates the example config; `SimState` contract + mock fixtures + stub player ready for UI

---

## M1-UI — Skins + player UI + builder shell on MOCKED data (UI-FIRST)
*Build the visible product against mocked `SimState`/stub player — no engine yet. Validate UX + confirm what the engine/schema must produce.*

- [ ] M1U.1 `@typecaast/skin-kit`: `defineSkin`, `Skin`/`Capabilities`/`SkinTokens` types, theme context, font-loader helper
- [ ] M1U.2 `skin-kit`: shared animation primitives driven by `revealProgress` (fade/slide, typing dots, reaction pop)
- [ ] M1U.3 `@typecaast/react`: `<Typecaast>` + `useTypecaast` wired to the **stub player over mock `SimState`** (rAF clock against faked timeline)
- [ ] M1U.4 `react`: theme resolution (`auto` → OS/`matchMedia`, reactive; fallback `light`)
- [ ] M1U.5 `react`: per-skin web-font loading on mount (live correct fonts)
- [ ] M1U.6 `react`: responsive `fit` modes (reflow / scale / fixed) + overflow auto-scroll
- [ ] M1U.7 `react`: in-message image rendering
- [ ] M1U.8 Slack skin: Frame (thread header, "N replies"), Message (grouping, timestamps), TypingIndicator, Reaction pill, Composer, SystemMessage (PR card + action buttons), Avatar
- [ ] M1U.9 Slack skin: light + dark tokens; Lato bundled; capability declaration
- [ ] M1U.10 Storybook for Slack skin (light + dark stories) — all driven by mock state
- [ ] M1U.11 Builder shell (early): timeline track + preview + controls **driving the mock** (no persistence/export yet) to feel out the editing UX
- [ ] M1U.E **Validation gate:** billing-toast thread looks/feels right (light + dark) from faked state; **scope of engine + schema confirmed / adjusted before writing logic**

---

## M1-engine — Real engine behind the validated UI (TRUE MVP)
*Swap mocks for real logic; the UI should not need to change.*

- [ ] M1E.1 `@typecaast/core`: seeded RNG; pacing model types
- [ ] M1E.2 `core`: `compile(config)` — auto-pacing (WPM/CPS, gaps, reaction lag, jitter) + per-step overrides → absolute timeline
- [ ] M1E.3 `core`: `getStateAt(t)` pure sampler → `SimState` (matches the M0.9 contract)
- [ ] M1E.4 `core`: capability resolution (drop unsupported events/content per skin, retain in config)
- [ ] M1E.5 `core`: real Player (play/pause/seek/scrubTo/setRate/stepNext/stepPrev/loop, tick/end) replacing the stub
- [ ] M1E.6 `core` tests: determinism (referential stability), pacing math, capability resolution, override precedence
- [ ] M1E.7 Swap `react`/builder from mock to real engine; confirm zero UI changes needed (any change = a contract miss to note)
- [ ] M1E.E **Exit demo:** billing-toast plays from a real config end-to-end, light + dark, Lato rendering

---

## M2 — Video export (self-hosted)
*Exit: billing-toast renders to MP4/GIF locally; frame-parity test green.*

- [ ] M2.1 `@typecaast/remotion`: `<TypecaastComposition>` mapping frame→t→`getStateAt`
- [ ] M2.2 `remotion`: duration from timeline; canvas size + scale factor; transparent bg
- [ ] M2.3 `remotion`: font + emoji loading in the Remotion runtime (deterministic)
- [ ] M2.4 `cli`: `render` command (format, --size/aspect presets, --scale, --theme [default light], --transparent)
- [ ] M2.5 Pinned render container image (Chromium/Remotion/Node/fonts/emoji) + docs
- [ ] M2.6 **Frame-parity test:** React state at t === Remotion state at frame across fixtures
- [ ] M2.7 Render smoke test in CI (short config → MP4)
- [ ] M2.8 Keep renderer a clean callable package (future paid-service seam)
- [ ] M2.E **Exit demo:** `typecaast render billing-toast.json` → MP4 + GIF, 16:9 and 9:16

---

## M3a — Flagship skins + skin-kit beta
*Exit: a third party can author a skin from docs alone.*

- [ ] M3a.1 Claude Code (TUI) skin — mono font, ANSI palette, prompt/spinner/streaming output (dark-first)
- [ ] M3a.2 iMessage (iOS) skin — full-bleed bubbles, contact bar, keyboard, status bar; Inter substitute; light + dark
- [ ] M3a.3 One more flagship (Cursor panel OR WhatsApp) to stress the contract
- [ ] M3a.4 Visual-regression harness (light + dark) gated against reference screenshots
- [ ] M3a.5 `@typecaast/skin-kit` beta published + Storybook regression template
- [ ] M3a.6 Skin-authoring docs ("Build a skin": contract, capabilities, fonts, tokens, pixel-perfect bar)
- [ ] M3a.E **Exit demo:** external contributor authors a trivial skin following docs only

---

## M3b — Remaining presets + ecosystem
- [ ] M3b.1 Cursor panel skin (if not done in M3a)
- [ ] M3b.2 Messages (macOS) skin — sidebar, window chrome, wider layout (shares iOS tokens)
- [ ] M3b.3 WhatsApp skin (green accent, double-tick receipts)
- [ ] M3b.4 Discord / Telegram skin (channel layout, role colors)
- [ ] M3b.5 `create-typecaast-skin` scaffold CLI
- [ ] M3b.6 AI authoring skill (`skill: create-skin`) — screenshot/draft → theme-aware skin
- [ ] M3b.7 Community registry/gallery (GitHub-based) + submission checklist
- [ ] M3b.E **Exit demo:** all v1 presets in gallery, light + dark, passing regression

---

## M4 — Builder + hosted site (UI/embed only)
*Exit: public generator; passes the design-review gate.*

- [ ] M4.1 Design system: tokens (type scale, spacing, radius, motion), core components (bespoke, not stock)
- [ ] M4.2 `@typecaast/builder`: harden the M1-UI builder shell into the full timeline track editor (add/reorder/delete, drag-retime, per-step overrides)
- [ ] M4.3 builder: preview-as-you-go — scrub, step, loop range, inline timing/pacing edits with live re-pace
- [ ] M4.4 builder: participant manager; skin picker + auto options form; capability/lint panel
- [ ] M4.5 builder: output controls — aspect presets + scale, editable mid-script with live reflow; fit/fps/seed
- [ ] M4.6 builder: theme toggle; import/paste JSON (round-trip); export JSON + embed snippet (inline vs url assets)
- [ ] M4.7 builder: state persisted to URL + localStorage
- [ ] M4.8 Next.js site: landing (dogfooded live sims as hero), MDX docs, playground (= builder), preset gallery, examples
- [ ] M4.9 a11y: axe in CI for builder + embed; keyboard nav; reduced-motion; transcript; manual SR smoke
- [ ] M4.10 **PostHog analytics (site/builder only):** reverse-proxy ingest, pageview autocapture, builder funnel events (§27), flags
- [ ] M4.10b **Consent model:** opt-in content-sharing banner; default **obfuscates content client-side** (interactions only); consent-keyed content-field gate; masking + recordings follow the same switch; revocable; publish `ANALYTICS.md` (events, what opt-in unlocks, region, retention) (§27)
- [ ] M4.11 **Telemetry guard:** CI test asserting `core`/`react`/`skins`/`skin-kit`/`cli` import no analytics SDK (zero phone-home)
- [ ] M4.12 Provision via MCP: **Vercel** (project/env/domain), **Cloudflare** (DNS + proxy route + SSL), **PostHog** (project/flags/dashboards) — capture as runbooks in private ops repo (§28/§29)
- [ ] M4.13 Deploy to Vercel; per-PR preview deploys
- [ ] M4.E **Exit demo:** builder produces a working embed + self-contained config; analytics funnel visible in PostHog; **named design review passed**

---

## M5 — Capture (extension + saved-page) — CUT-LINE
*Exit: capture a page → confirm slots → play; meets capture quality bar (§10).*

- [ ] M5.1 Distiller: subtree isolation (visible/selected only, drop hidden DOM + data-*) + repeating-row → slotted template + scoped CSS + token extraction → `SkinDraft`
- [ ] M5.2 **Security: sanitize allowlist** (strip scripts/handlers/iframes/js+nonimage-data URLs/CSS hazards); render template skins in shadow-DOM + sandboxed iframe; strict CSP; **hostile-fixture CI suite** (§10)
- [ ] M5.2b Capture hygiene: one-time pre-share notice; safer share defaults; local-first (§18)
- [ ] M5.2c Style scoping verified on a hostile host page (zero leakage both directions)
- [ ] M5.3 MV3 Chrome extension: element picker → capture → draft (local-only)
- [ ] M5.4 Saved-page importer (.html/.mhtml) → same distiller
- [ ] M5.5 `TemplateSkinAdapter` — captured drafts satisfy the `Skin` contract via slot filling
- [ ] M5.6 `typecaast scaffold-skin` — draft → editable template skin package
- [ ] M5.7 Light/dark double-capture flow
- [ ] M5.8 Capture quality-bar fixtures + metrics (slot detection ≥80%, fix time ≤10min)
- [ ] M5.9 Docs: capture guide + cleanup walkthrough
- [ ] M5.10 Capture PostHog AI chat → promote to built-in skin
- [ ] M5.E **Exit demo:** capture a real page, confirm slots, play a simulation in it

---

## Release
- [ ] R.1 v0.9 (M0–M4) if M5 slips; or v1.0 (M0–M5)
- [ ] R.2 Changelog via Changesets; dist-tags (alpha/beta/latest)
- [ ] R.3 Docs site + README final pass; disclaimers/trademarks + license labeling in place
- [ ] R.4 **Pre-launch security review/pentest** of capture + template-skin path (§10) — hard gate if M5 shipped
- [ ] R.5 Lawyer sign-off on FSL tiering + trade-dress posture (§17)

---

## Future — Paid render service (private `typecaast-cloud` repo, post-v1)
*Depends on public packages; secrets never in public tree (§29).*

- [ ] C.1 Private repo `typecaast-cloud`; depends on published `@typecaast/*`
- [ ] C.2 Render worker: managed `@remotion/lambda` wrapping the M2 renderer package
- [ ] C.3 Stripe via MCP: product + prices (single video, light+dark bundle), checkout, webhooks
- [ ] C.4 Purchase funnel analytics (PostHog) reconciled against Stripe as source of truth (§27)
- [ ] C.5 Persist purchased config; one-reexport diff (% nodes changed threshold)
- [ ] C.6 Ops: queue/concurrency, retry/idempotency, storage retention, refunds (§24)
- [ ] C.6b **SSRF/egress hardening:** block private/metadata IPs (resolve-then-validate), https+image-only allowlist, size/time limits, restricted worker egress; prefer inlining assets before render (§24)
- [ ] C.7 Guardrail: no auto-charging; money actions explicitly confirmed
