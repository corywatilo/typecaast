import type { CSSProperties } from "react";

/**
 * A small bespoke token set for the builder chrome. This is the early shell
 * (M1U.11) — M4 replaces it with the full design system (PLAN §11).
 */
export const ui = {
  bg: "#16161a",
  panel: "#1e1e24",
  panelBorder: "#2a2a32",
  text: "#e7e7ea",
  subtle: "#9a9aa6",
  accent: "#6c5ce7",
  accentText: "#ffffff",
  chip: "#26262e",
  chipActive: "#34344a",
  stage: "#0f0f12",
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
} as const;

export const panelStyle: CSSProperties = {
  background: ui.panel,
  color: ui.text,
  fontFamily: ui.font,
};
