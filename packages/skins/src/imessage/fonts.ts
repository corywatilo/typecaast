import type { FontDeclaration } from "@typecaast/skin-kit";

/**
 * iMessage uses **SF Pro**, which is Apple-licensed and unavailable on
 * Windows/Linux — so the skin ships **Inter** (OFL) as the documented stand-in
 * (PLAN §19). The skin records both the intended font and the shipped
 * substitute so the choice is transparent.
 */
export const imessageFonts: FontDeclaration[] = [
  {
    family: "Inter",
    intended: "SF Pro",
    weights: [400, 500, 600],
    sources: [
      {
        url: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2",
        weight: 400,
        format: "woff2",
      },
      {
        url: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2",
        weight: 600,
        format: "woff2",
      },
    ],
  },
];
