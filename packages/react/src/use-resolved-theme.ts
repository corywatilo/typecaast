import { useSyncExternalStore } from "react";
import type { ThemeMode } from "@typecaast/schema";
import type { ResolvedTheme } from "@typecaast/core";

const QUERY = "(prefers-color-scheme: dark)";

function getMql(): MediaQueryList | null {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  return window.matchMedia(QUERY);
}

function subscribe(onChange: () => void): () => void {
  const mql = getMql();
  if (!mql) return () => {};
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return getMql()?.matches ?? false;
}

/** No `matchMedia` on the server → default to light (consistent with export). */
function getServerSnapshot(): boolean {
  return false;
}

/** Reactively tracks the host's `prefers-color-scheme: dark`. */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Resolve a theme mode to a concrete theme. `light`/`dark` are forced; `auto`
 * tracks the host `prefers-color-scheme` reactively and falls back to `light`
 * when no preference signal is available.
 */
export function useResolvedTheme(mode: ThemeMode): ResolvedTheme {
  const prefersDark = usePrefersDark();
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return prefersDark ? "dark" : "light";
}
