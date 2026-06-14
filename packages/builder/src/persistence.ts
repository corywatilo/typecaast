import type { ConfigInput } from "@typecaast/schema";

const KEY = "typecaast:config";
const HASH_PREFIX = "#c=";

const hasWindow = (): boolean => typeof window !== "undefined";

/** Auto-save the working config to localStorage. */
export function saveLocal(config: ConfigInput): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(config));
  } catch {
    /* storage may be unavailable (private mode) — ignore */
  }
}

export function loadLocal(): ConfigInput | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConfigInput) : null;
  } catch {
    return null;
  }
}

export function clearLocal(): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Encode the config into the URL hash (replaceState — no history pollution). */
export function updateUrl(config: ConfigInput): void {
  if (!hasWindow()) return;
  const hash = HASH_PREFIX + encodeURIComponent(JSON.stringify(config));
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", pathname + search + hash);
}

export function loadFromUrl(): ConfigInput | null {
  if (!hasWindow()) return null;
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    return JSON.parse(
      decodeURIComponent(hash.slice(HASH_PREFIX.length)),
    ) as ConfigInput;
  } catch {
    return null;
  }
}

/** The current shareable URL (config lives in the hash after `updateUrl`). */
export function shareUrl(): string {
  return hasWindow() ? window.location.href : "";
}
