# Analytics & Telemetry

> **Stub** — the full event/property table is published as part of M4 (builder + site analytics). This file states the hard rules and the planned model so they're committed from day one.

## Hard rule: zero telemetry in shipped packages

The embeddable runtime — `@typecaast/core`, `@typecaast/react`, `@typecaast/skins`, `@typecaast/skin-kit` — and `@typecaast/cli` contain **no telemetry**: no phone-home, no analytics SDK, nothing that fires from a user's embed or local render. This is enforced by a CI guard test (M4.11) that fails if any of these packages import an analytics SDK.

Instrumentation is confined to the **hosted site + builder** (and later the paid render service).

## Provider

[PostHog](https://posthog.com), loaded via a first-party **reverse proxy** (e.g. `/ingest`) so it stays first-party and isn't blocked. The PostHog **project API key is publishable** (client-side by design); personal/admin API keys are secret and never committed.

## Consent model (content sharing is opt-in; default obfuscated)

- **Opted out (default):** message text, config JSON, image bytes/data URLs, and captured DOM are **obfuscated client-side before anything is sent**. We capture only structural/behavioral events (which skin, step count, output size, which action).
- **Opted in (explicit):** the user agrees to also send authored content (message text, config) for product improvement. Raw image bytes / captured DOM stay excluded by default; the grant is **revocable**.
- Enforced by an **allowlisted event-property schema** + a content-field gate keyed to consent — not free-form `capture()` calls — so "opted out = no content" is a code guarantee.
- **Session-recording masking follows the same switch:** text inputs and content-editing surfaces are masked by default; recording is consent-gated.

## Planned funnels (detail lands in M4)

- **Builder funnel:** `builder_opened`, `skin_selected`, `step_added`, `timeline_edited`, `pacing_adjusted`, `theme_toggled`, `output_size_changed`, `preview_played`, `config_imported`, `embed_copied`, `json_exported`, `render_snippet_copied`, `share_link_created`.
- **Purchase funnel (paid render service, when live):** `render_for_me_clicked` → `checkout_started` → `purchase_completed` → `render_delivered`, plus `reexport_used`. Reconciled against Stripe as source of truth.

## Transparency

The final version of this document lists **every event and property**, what the opt-in unlocks, the **data region** (EU or US, chosen deliberately), and **retention windows**. Consent state is visible and changeable in-product.
