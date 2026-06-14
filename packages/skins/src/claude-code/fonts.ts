import type { FontDeclaration } from "@typecaast/skin-kit";

/**
 * The TUI uses **JetBrains Mono** (OFL, bundleable). Sources point at the
 * Fontsource CDN woff2 files; real bundling lands with the font-map gate.
 */
export const tuiFonts: FontDeclaration[] = [
  {
    family: "JetBrains Mono",
    weights: [400, 700],
    sources: [
      {
        url: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff2",
        weight: 400,
        format: "woff2",
      },
      {
        url: "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.woff2",
        weight: 700,
        format: "woff2",
      },
    ],
  },
];
