import type { FontDeclaration } from "./types.js";

/** Build a CSS `src:` value from a font's sources. */
function srcValue(decl: FontDeclaration): string {
  return decl.sources
    .map((s) => {
      const format = s.format ? ` format("${s.format}")` : "";
      return `url("${s.url}")${format}`;
    })
    .join(", ");
}

/**
 * Load a skin's declared web fonts so live preview matches the platform (not
 * just video export). SSR-safe: a no-op when `document`/`FontFace` are absent
 * (server render, Remotion Node). Idempotent per family+weight+style.
 *
 * Returns once every face has loaded (or immediately, off the main document).
 */
export async function loadSkinFonts(
  fonts: FontDeclaration[] | undefined,
): Promise<void> {
  if (!fonts || fonts.length === 0) return;
  if (
    typeof document === "undefined" ||
    typeof FontFace === "undefined" ||
    !document.fonts
  ) {
    return;
  }

  const pending: Promise<unknown>[] = [];
  for (const decl of fonts) {
    for (const source of decl.sources) {
      const descriptors: FontFaceDescriptors = {};
      if (source.weight !== undefined)
        descriptors.weight = String(source.weight);
      if (source.style !== undefined) descriptors.style = source.style;

      const single: FontDeclaration = { ...decl, sources: [source] };
      const face = new FontFace(decl.family, srcValue(single), descriptors);

      // Skip if an identical face is already registered.
      const already = [...document.fonts].some(
        (f) =>
          f.family === decl.family &&
          f.weight === (descriptors.weight ?? "normal") &&
          f.style === (descriptors.style ?? "normal"),
      );
      if (already) continue;

      document.fonts.add(face);
      pending.push(face.load());
    }
  }
  await Promise.all(pending);
}
