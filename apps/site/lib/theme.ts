/**
 * Site color-theme preference (auto / light / dark). The choice is persisted in
 * localStorage and applied by toggling `data-tc-theme` on `<html>`, which drives
 * every `--tc-*` design token (see `@typecaast/ui`). "auto" follows the OS.
 *
 * An inline script in the root layout applies the stored value before paint to
 * avoid a flash; this module keeps it in sync at runtime and lets any component
 * read/cycle it (the footer toggle + the global `m` shortcut).
 */

import { useEffect, useState } from "react";

export type SiteTheme = "auto" | "light" | "dark";

const KEY = "tc-site-theme";
export const THEME_EVENT = "tc-site-theme-change";
export const THEME_ORDER: SiteTheme[] = ["auto", "light", "dark"];

export function getSiteTheme(): SiteTheme {
  if (typeof localStorage === "undefined") return "dark";
  const v = localStorage.getItem(KEY);
  return v === "auto" || v === "light" || v === "dark" ? v : "dark";
}

function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveSiteTheme(t: SiteTheme): "light" | "dark" {
  return t === "auto" ? systemTheme() : t;
}

export function applySiteTheme(t: SiteTheme): void {
  if (typeof document !== "undefined")
    document.documentElement.dataset.tcTheme = resolveSiteTheme(t);
}

export function setSiteTheme(t: SiteTheme): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, t);
  applySiteTheme(t);
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: t }));
}

/**
 * Subscribe to the resolved site theme (light/dark). Re-renders when the user
 * toggles (the `m` shortcut / footer control) or, for "auto", when the OS
 * preference changes. Use it to drive components that don't read `data-tc-theme`
 * via CSS (e.g. the builder's ThemeRoot).
 */
export function useResolvedSiteTheme(): "light" | "dark" {
  const [resolved, setResolved] = useState<"light" | "dark">("dark");
  useEffect(() => {
    const sync = () => setResolved(resolveSiteTheme(getSiteTheme()));
    sync();
    window.addEventListener(THEME_EVENT, sync);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      mq.removeEventListener("change", sync);
    };
  }, []);
  return resolved;
}

/** Advance auto → light → dark → auto and persist. Returns the new value. */
export function cycleSiteTheme(): SiteTheme {
  const next =
    THEME_ORDER[
      (THEME_ORDER.indexOf(getSiteTheme()) + 1) % THEME_ORDER.length
    ]!;
  setSiteTheme(next);
  return next;
}
