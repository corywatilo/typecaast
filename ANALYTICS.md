# Analytics & Telemetry

## Hard rule: zero telemetry in shipped packages

The embeddable runtime — `@typecaast/core`, `@typecaast/react`, `@typecaast/skins`, `@typecaast/skin-kit`, `@typecaast/capture` — and `@typecaast/cli` contain **no telemetry**: no phone-home, no analytics SDK, nothing that fires from a user's embed or local render. This is enforced by a CI guard (`scripts/check-no-telemetry.mjs`, M4.11) that fails if any of these packages declare an analytics SDK.

Instrumentation is confined to the **hosted site + builder** (`apps/site`) — and later the paid render service.

## Provider & region

[PostHog](https://posthog.com), **US** region (`us.i.posthog.com`), loaded through a first-party **reverse proxy** at `/ingest` (Next.js rewrites in `apps/site/next.config.mjs`) so it stays first-party and isn't ad-blocked. The PostHog **project API key is publishable** (client-side by design); personal/admin keys are secret and never committed (kept in `.env` / `.env.local`, both gitignored).

## Consent model (content sharing is opt-in; default obfuscated)

Implemented in `apps/site/lib/analytics.tsx`.

- **Opted out (default):** `mask_all_text` + `mask_all_element_attributes` are on and session recording is disabled, so message text, config JSON, and DOM content are **masked before anything is sent**. We capture only structural/behavioral events (which skin, step count, which action) and URL-only pageviews. `autocapture` is **off** — events come only from the allowlisted `track()` helper, so "opted out = no content" is a code guarantee, not a policy.
- **Opted in (explicit):** unmasks content and enables session recording (`startSessionRecording`). The grant is stored in `localStorage` and is **revocable** anytime via the footer's “Analytics preferences” link, which re-opens the banner.
- **Do Not Track** is always honored (`respect_dnt: true`).

## Events

All site/builder events are an allowlist (`TcEvent`). Builder-package events reach the site through a telemetry-free `onEvent` callback on `<Builder>` (the package ships no SDK).

| Event                   | Trigger                                | Source                             |
| ----------------------- | -------------------------------------- | ---------------------------------- |
| `builder_opened`        | Playground/builder mounts              | `app/playground/page.tsx`          |
| `gallery_viewed`        | Gallery page mounts                    | `app/gallery/page.tsx`             |
| `docs_viewed`           | Docs page mounts                       | `components/DocsViewedTracker.tsx` |
| `skin_selected`         | Skin changed (`skin_id`)               | `onChange` diff                    |
| `step_added`            | Step added (`step_type`, `step_count`) | `onChange` diff                    |
| `preview_played`        | Preview play pressed                   | builder `onEvent`                  |
| `json_exported`         | JSON downloaded or copied              | builder `onEvent`                  |
| `embed_copied`          | Embed snippet copied                   | builder `onEvent`                  |
| `render_snippet_copied` | CLI render command copied              | builder `onEvent`                  |

No event carries authored content while opted out. Property values are structural (ids, counts, sizes, types) — never message text.

### Purchase funnel (paid render service, when live)

`render_for_me_clicked` → `checkout_started` → `purchase_completed` → `render_delivered`, plus `reexport_used`. Reconciled against Stripe as the source of truth. Lives in the private `typecaast-cloud` repo, not here.

## Feature flags

Read via `isFeatureEnabled(flag)` (PostHog flags), loaded by the client after init.

## Retention

- **Events:** PostHog project default retention (rolling; not extended for this project).
- **Session recordings:** only captured for opted-in users; subject to PostHog's recording retention.
- **Consent state:** stored only in the visitor's browser (`localStorage`), never server-side.

## Transparency

This document lists every event and property, what opting in unlocks, the data region (US), and retention. Consent state is visible and changeable in-product (footer → **Analytics preferences**).
