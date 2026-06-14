import type { ThemeMode } from "@typecaast/schema";
import type { ResolvedTheme } from "@typecaast/core";

/**
 * Resolve a theme mode to a concrete theme. `auto` falls back to `light`
 * here; M1U.4 makes `auto` reactive against the host `prefers-color-scheme`
 * via a hook layered on top of this.
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === "dark" ? "dark" : mode === "light" ? "light" : "light";
}
