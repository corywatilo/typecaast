import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

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

const getSnapshot = (): boolean => getMql()?.matches ?? false;
const getServerSnapshot = (): boolean => false;

/**
 * Tracks `prefers-reduced-motion: reduce`. When true, the player snaps to the
 * final state instead of animating (PLAN §20).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
