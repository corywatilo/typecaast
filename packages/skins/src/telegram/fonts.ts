import type { FontDeclaration } from "@typecaast/skin-kit";

/**
 * Telegram Desktop renders with the host **system UI font**; Telegram Web/Android
 * use **Roboto**. We declare Roboto (Apache-2.0, bundleable) as the substitute
 * so the look is stable across the live preview and the video renderer, falling
 * back to the system stack.
 */
export const telegramFonts: FontDeclaration[] = [
  {
    family: "Roboto",
    intended: "system-ui / Roboto",
    weights: [400, 500, 700],
    sources: [
      {
        url: "https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Mu4mxK.woff2",
        weight: 400,
        format: "woff2",
      },
      {
        url: "https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmEU9fBBc-.woff2",
        weight: 500,
        format: "woff2",
      },
      {
        url: "https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc-.woff2",
        weight: 700,
        format: "woff2",
      },
    ],
  },
];

/** The CSS font stack the skin renders with (declared font first). */
export const TELEGRAM_FONT_STACK =
  'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
