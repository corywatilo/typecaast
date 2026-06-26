import { useEffect } from "react";
import type { Config } from "@typecaast/schema";

/**
 * Every image URL a config will render: participant avatars plus in-message
 * images (the `images` sugar and explicit `image` content nodes). Deterministic
 * and side-effect free so it's safe to call on the server.
 */
function collectImageUrls(config: Config): string[] {
  const urls = new Set<string>();
  for (const p of config.participants) if (p.avatar) urls.add(p.avatar);
  for (const step of config.timeline) {
    const s = step as {
      images?: Array<{ src?: unknown }>;
      content?: Array<{ type?: unknown; src?: unknown }>;
    };
    if (Array.isArray(s.images))
      for (const im of s.images)
        if (typeof im?.src === "string") urls.add(im.src);
    if (Array.isArray(s.content))
      for (const n of s.content)
        if (n?.type === "image" && typeof n.src === "string") urls.add(n.src);
  }
  return [...urls];
}

// Keep a live reference to every preloaded image, module-wide. This (a) dedupes
// across instances/renders so a URL is only fetched once, and (b) retains the
// `Image` so an in-flight fetch isn't aborted when GC'd mid-flight — the browser
// HTTP cache then serves the skin's later `<img>` instantly (even inside a
// shadow root). One element per unique URL; negligible.
const preloaded = new Map<string, HTMLImageElement>();

function preload(url: string): void {
  if (preloaded.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  preloaded.set(url, img);
  // Warm the decoded bitmap too so display has no decode hitch; ignore failures
  // (a bad URL just falls back to the skin's normal `<img>`/initials).
  void img.decode?.().catch(() => {});
}

/**
 * Preload a config's images on mount so an avatar (or in-message image) is
 * cached before its message appears and never "pops in" late mid-playback.
 * Client-only and SSR-safe — a no-op where `Image` is undefined.
 */
export function usePreloadImages(config: Config): void {
  // `config` is identity-stable across re-renders (`<Typecaast>` de-dupes it by
  // content), so this runs once per distinct config rather than every render.
  useEffect(() => {
    if (typeof Image === "undefined") return;
    for (const url of collectImageUrls(config)) preload(url);
  }, [config]);
}
