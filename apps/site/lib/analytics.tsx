"use client";

import { useEffect, useState } from "react";

/**
 * Analytics live on the hosted site only — never in the shipped packages
 * (PLAN §27). Events are an allowlist (not free-form `capture`), so "opted out =
 * no content" is a code guarantee. Activates only when NEXT_PUBLIC_POSTHOG_KEY
 * is set; otherwise a no-op.
 *
 * Consent model (M4.10b): the default is **content-obfuscated** — text and
 * attributes are masked and session recording is off, so we only ever see
 * structural/behavioral events. Opting in unmasks content (and allows
 * recording); the choice is persisted and **revocable**. DNT is always honored.
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
  | "render_snippet_copied"
  | "gallery_viewed"
  | "gallery_json_viewed"
  | "docs_viewed";

interface PostHogLike {
  capture(
    event: string,
    props?: Record<string, string | number | boolean>,
  ): void;
  init(key: string, options: Record<string, unknown>): void;
  set_config(options: Record<string, unknown>): void;
  startSessionRecording?(): void;
  stopSessionRecording?(): void;
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

// ── Consent ────────────────────────────────────────────────────────────────

export type Consent = "granted" | "denied";
const CONSENT_KEY = "tc-consent";
const CONSENT_EVENT = "tc-consent-change";

export function getConsent(): Consent | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "granted" || v === "denied" ? v : null;
}

/** Apply a consent value to the live PostHog client (masking + recording). */
function applyConsent(c: Consent): void {
  if (!client) return;
  const masked = c !== "granted";
  client.set_config({
    mask_all_text: masked,
    mask_all_element_attributes: masked,
  });
  if (c === "granted") client.startSessionRecording?.();
  else client.stopSessionRecording?.();
}

/** Record (or change) the consent choice. `null` clears it and re-prompts. */
export function setConsent(c: Consent | null): void {
  if (typeof localStorage !== "undefined") {
    if (c) localStorage.setItem(CONSENT_KEY, c);
    else localStorage.removeItem(CONSENT_KEY);
  }
  if (c) applyConsent(c);
  else applyConsent("denied"); // re-mask while undecided
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function Analytics() {
  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    const consent = getConsent();
    const masked = consent !== "granted";
    void import("posthog-js").then((mod) => {
      if (cancelled) return;
      const posthog = mod.default as unknown as PostHogLike;
      posthog.init(KEY, {
        api_host: INGEST_PROXY,
        ui_host: UI_HOST,
        capture_pageview: true,
        autocapture: false,
        // Default-masked; opting in flips this via set_config (applyConsent).
        mask_all_text: masked,
        mask_all_element_attributes: masked,
        // Recording is consent-gated; only starts when explicitly granted.
        disable_session_recording: true,
        respect_dnt: true,
      });
      client = posthog;
      if (consent === "granted") applyConsent("granted");
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

/**
 * The consent banner. Shows only when a choice hasn't been made (and a key is
 * configured). "Usage stats only" keeps content masked; "Allow content" opts in.
 * Re-openable from the footer via `setConsent(null)`.
 */
export function ConsentBanner() {
  const [decided, setDecided] = useState(true);

  useEffect(() => {
    if (!KEY) return;
    const sync = () => setDecided(getConsent() !== null);
    sync();
    window.addEventListener("tc-consent-change", sync);
    return () => window.removeEventListener("tc-consent-change", sync);
  }, []);

  if (!KEY || decided) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        margin: "0 auto",
        zIndex: 1000,
        background: "var(--tc-panel, #1a1a1a)",
        color: "var(--tc-text, #e8e8e8)",
        border: "1px solid var(--tc-border, #333)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <p style={{ margin: "0 0 12px" }}>
        We use privacy-friendly analytics. By default we collect only{" "}
        <strong>usage stats</strong> (which skin, step counts, actions) — your
        message text and configs stay masked. You can also let us see authored
        content to improve the product. Either way it&rsquo;s revocable. See{" "}
        <a
          href="https://github.com/corywatilo/typecaast/blob/master/ANALYTICS.md"
          style={{ color: "var(--tc-accent, #5b5bd6)" }}
        >
          what we collect
        </a>
        .
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setConsent("granted")}
          style={btn(true)}
        >
          Allow content
        </button>
        <button
          type="button"
          onClick={() => setConsent("denied")}
          style={btn(false)}
        >
          Usage stats only
        </button>
      </div>
    </div>
  );
}

/** Footer link to re-open the consent prompt (revoke/change the choice). */
export function ManageAnalyticsLink({ className }: { className?: string }) {
  if (!KEY) return null;
  return (
    <a
      href="#"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        setConsent(null);
      }}
    >
      Analytics preferences
    </a>
  );
}

function btn(primary: boolean): React.CSSProperties {
  return {
    padding: "7px 14px",
    borderRadius: 8,
    border: primary ? "0" : "1px solid var(--tc-border, #444)",
    background: primary ? "var(--tc-accent, #5b5bd6)" : "transparent",
    color: primary ? "#fff" : "inherit",
    font: "inherit",
    fontWeight: 600,
    cursor: "pointer",
  };
}
