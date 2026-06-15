import type { ConfigInput } from "@typecaast/schema";

const KEY = "typecaast:config";

const hasWindow = (): boolean => typeof window !== "undefined";

/** Auto-save the working config to localStorage (the only persistence). */
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
