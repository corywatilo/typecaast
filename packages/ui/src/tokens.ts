/**
 * Typecaast design tokens. The CSS custom properties in `styles.css` are the
 * runtime source of truth (themed via `[data-tc-theme]`); these mirror the
 * scales for places that need values in JS.
 */

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/** Type scale (px) — a tight, considered ramp. */
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 15,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 38,
  display: 52,
} as const;

export const motion = {
  fast: "120ms",
  base: "180ms",
  slow: "280ms",
  ease: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export const fontFamily = {
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace',
} as const;

/** The single brand accent (iris). Change here + in styles.css to rebrand. */
export const accent = "#5b5bd6";
