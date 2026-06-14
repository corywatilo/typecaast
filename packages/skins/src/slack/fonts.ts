import type { FontDeclaration } from "@typecaast/skin-kit";

/**
 * Slack uses **Lato** (OFL, bundleable) — the real font, not a substitute
 * (PLAN §19). Sources point at the OFL woff2 files; real bundling/pinning of
 * the font assets lands with the font-map gate (M3a / video runtime).
 */
export const slackFonts: FontDeclaration[] = [
  {
    family: "Lato",
    weights: [400, 700, 900],
    sources: [
      {
        url: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.woff2",
        weight: 400,
        format: "woff2",
      },
      {
        url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ3q5d0.woff2",
        weight: 700,
        format: "woff2",
      },
      {
        url: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh50XSwiPGQ3q5d0.woff2",
        weight: 900,
        format: "woff2",
      },
    ],
  },
];

/** The CSS font stack the skin renders with (declared font first). */
export const SLACK_FONT_STACK =
  'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
