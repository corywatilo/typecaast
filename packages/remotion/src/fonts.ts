import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { loadSkinFonts, type Skin } from "@typecaast/skin-kit";

/**
 * Load a skin's declared fonts in the Remotion runtime, holding the render
 * (`delayRender`) until they're ready so text measures and wraps identically
 * every frame (PLAN §19). The emoji font is pinned by the render container
 * (§/M2.5), not loaded here.
 */
export function useRemotionFonts(skin: Skin): void {
  const [handle] = useState(() =>
    delayRender(`typecaast: loading fonts for "${skin.id}"`),
  );

  useEffect(() => {
    loadSkinFonts(skin.meta.fonts).finally(() => continueRender(handle));
  }, [skin, handle]);
}
