import { useEffect, useState } from "react";
import { loadSkinFonts, type Skin } from "@typecaast/skin-kit";

export type FontLoadState = "loading" | "loaded";

/**
 * Load a skin's declared web fonts on mount so the live preview renders in the
 * correct typeface (PLAN §19) — never relying on a host OS font. SSR-safe and
 * a no-op off the DOM (resolves "loaded"). Re-runs if the skin's fonts change.
 */
export function useSkinFonts(skin: Skin): FontLoadState {
  const fonts = skin.meta.fonts;
  const [state, setState] = useState<FontLoadState>(() =>
    fonts && fonts.length > 0 ? "loading" : "loaded",
  );

  useEffect(() => {
    if (!fonts || fonts.length === 0) {
      setState("loaded");
      return;
    }
    let cancelled = false;
    setState("loading");
    loadSkinFonts(fonts).finally(() => {
      if (!cancelled) setState("loaded");
    });
    return () => {
      cancelled = true;
    };
  }, [fonts]);

  return state;
}
