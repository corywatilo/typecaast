"use client";

import { useEffect } from "react";

/**
 * Analytics live on the hosted site only — never in the shipped packages
 * (PLAN §27). Events are an allowlist (not free-form `capture`), so "opted out =
 * no content" is a code guarantee. Activates only when NEXT_PUBLIC_POSTHOG_KEY
 * is set; otherwise a no-op. Consent-gated content sharing (M4.10b) layers on.
 */

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// The browser always talks to the same-origin reverse proxy (see next.config);
// `ui_host` points dashboard links at the real app host (region-derived).
const INGEST_PROXY = "/ingest";
const UI_HOST = (
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
).replace(".i.posthog.com", ".posthog.com");

export type TcEvent =
  | "builder_opened"
  | "skin_selected"
  | "step_added"
  | "preview_played"
  | "json_exported"
  | "embed_copied"
  | "share_link_created"
  | "render_snippet_copied"
  | "gallery_viewed"
  | "docs_viewed";

interface PostHogLike {
  capture(
    event: string,
    props?: Record<string, string | number | boolean>,
  ): void;
  init(key: string, options: Record<string, unknown>): void;
  isFeatureEnabled(flag: string): boolean | undefined;
}

let client: PostHogLike | null = null;

/** Track an allowlisted structural/behavioral event (no content). */
export function track(
  event: TcEvent,
  props?: Record<string, string | number | boolean>,
): void {
  client?.capture(event, props);
}

/** Read a PostHog feature flag (false until the client + flags have loaded). */
export function isFeatureEnabled(flag: string): boolean {
  return client?.isFeatureEnabled(flag) ?? false;
}

export function Analytics() {
  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    void import("posthog-js").then((mod) => {
      if (cancelled) return;
      const posthog = mod.default as unknown as PostHogLike;
      posthog.init(KEY, {
        api_host: INGEST_PROXY,
        ui_host: UI_HOST,
        capture_pageview: true,
        autocapture: false,
        // Content masked by default; opt-in unlocks it (M4.10b).
        mask_all_text: true,
        mask_all_element_attributes: true,
        respect_dnt: true,
      });
      client = posthog;
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
