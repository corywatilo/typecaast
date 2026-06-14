/**
 * Best-effort design-token extraction from the inline styles of a distilled
 * tree (PLAN §10). This is a starting palette for the skin author to rename and
 * curate — not an authoritative theme. We pull distinct colors (most-frequent
 * first), font families, border radii, and padding scales.
 */

interface Tokens {
  colors: Record<string, string>;
  fonts?: Record<string, string>;
  space?: Record<string, string>;
  radius?: Record<string, string>;
}

function parseStyle(style: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const decl of style.split(";")) {
    const idx = decl.indexOf(":");
    if (idx === -1) continue;
    const prop = decl.slice(0, idx).trim().toLowerCase();
    const val = decl.slice(idx + 1).trim();
    if (prop && val) m.set(prop, val);
  }
  return m;
}

const COLOR_RE = /(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\))/gi;

export function extractTokens(root: Element): Tokens {
  const colorFreq = new Map<string, number>();
  const fonts = new Set<string>();
  const radii = new Set<string>();
  const spaces = new Set<string>();

  const bump = (raw: string) => {
    const v = raw.trim();
    if (!v || v === "transparent" || v === "inherit" || v === "currentcolor")
      return;
    colorFreq.set(v, (colorFreq.get(v) ?? 0) + 1);
  };

  for (const el of [root, ...root.querySelectorAll("*")]) {
    const style = el.getAttribute("style");
    if (!style) continue;
    const decls = parseStyle(style);
    for (const [prop, val] of decls) {
      if (prop === "color" || prop.startsWith("background")) {
        const matches = val.match(COLOR_RE);
        if (matches) for (const c of matches) bump(c);
      }
      if (prop === "font-family") fonts.add(val);
      if (prop === "border-radius") radii.add(val);
      if (prop === "padding" || prop === "gap") spaces.add(val);
    }
  }

  const colors: Record<string, string> = {};
  [...colorFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .forEach(([c], i) => {
      colors[`color-${i + 1}`] = c;
    });

  const out: Tokens = { colors };
  if (fonts.size) {
    out.fonts = {};
    [...fonts].slice(0, 4).forEach((f, i) => {
      out.fonts![`font-${i + 1}`] = f;
    });
  }
  if (radii.size) {
    out.radius = {};
    [...radii].slice(0, 6).forEach((r, i) => {
      out.radius![`radius-${i + 1}`] = r;
    });
  }
  if (spaces.size) {
    out.space = {};
    [...spaces].slice(0, 8).forEach((s, i) => {
      out.space![`space-${i + 1}`] = s;
    });
  }
  return out;
}
