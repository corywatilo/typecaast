/**
 * Capture the CSS rules that *actually apply* to a captured subtree.
 *
 * Why this exists: modern apps (Tailwind, CSS modules, styled-components)
 * drive layout from utility classes. The captured subtree's `class`
 * attributes survive the trip into a skin shadow root, but the
 * **stylesheet defining what those classes mean** does not. Without that
 * stylesheet, `max-w-180` / `flex-grow` / `mx-auto` are no-ops, and the
 * captured page collapses to a vertical column.
 *
 * The fix: walk `document.styleSheets`, keep every rule whose selector
 * matches at least one element in the captured subtree (or in an
 * `@media`/`@supports`/`@container` wrapper that does), and emit that
 * subset as a CSS string for the skin's shadow root.
 *
 * Honest limitations:
 *   - Cross-origin stylesheets throw on `cssRules` access; we record them
 *     in the returned `skipped` list and continue.
 *   - Exotic selectors (`:has(...)` polyfills, custom pseudo) can throw
 *     in `querySelector` — we swallow those and treat the rule as
 *     non-matching.
 *   - We cap output size (default 256 KB). For pages with massive
 *     stylesheets the cap kicks in; the caller emits a warning.
 *   - We don't try to scope rules to the captured subtree — they are
 *     injected into a shadow root, so leakage to the host page is
 *     already prevented by the boundary.
 */

interface StyleSheetLike {
  href?: string | null;
  cssRules?: CSSRuleList;
  ownerNode?: Node | null;
}

interface DocumentLike {
  styleSheets: { [Symbol.iterator]: () => Iterator<StyleSheetLike> } & {
    length: number;
    [k: number]: StyleSheetLike;
  };
}

export interface CaptureCssOptions {
  /** Bytes-budget for the emitted CSS. Default 256 KB. */
  maxBytes?: number;
}

export interface CaptureCssResult {
  /** Concatenated CSS rules that match the captured subtree. */
  css: string;
  /** Stylesheets we couldn't read (typically CORS-blocked). */
  skipped: string[];
  /** True when we hit the byte cap and stopped collecting. */
  truncated: boolean;
}

/**
 * Test whether a CSS selector matches anything in the captured subtree.
 * Wraps `querySelector` so exotic selectors (`:has()` polyfills, vendor
 * pseudos) that throw don't abort the whole walk.
 */
function subtreeMatches(root: Element, selector: string): boolean {
  // Some Tailwind/utility selectors include `\:` escapes and arbitrary
  // value brackets (e.g. `.max-w-\[480px\]`) that querySelector handles
  // fine — but `:host`, `:root`, `&` etc. don't and would throw.
  // Cheap pre-filter: skip selectors that obviously target the document
  // root or page-wide chrome.
  if (selector === ":root" || selector === "html" || selector === "body")
    return false;
  try {
    return root.querySelector(selector) != null;
  } catch {
    return false;
  }
}

/**
 * Walk a rule list, collecting matching rules (and their containing
 * group rules) into `out`. Recursive — handles nested `@media`,
 * `@supports`, `@layer`, `@container`.
 */
function walkRules(
  rules: CSSRuleList,
  root: Element,
  out: string[],
  size: { bytes: number; cap: number },
): void {
  for (let i = 0; i < rules.length; i++) {
    if (size.bytes >= size.cap) return;
    const rule = rules[i]!;
    // Style rule (most common).
    if (rule.type === 1 /* STYLE_RULE */) {
      const r = rule as CSSStyleRule;
      const sel = r.selectorText;
      if (sel && sel.split(",").some((s) => subtreeMatches(root, s.trim()))) {
        const text = r.cssText;
        out.push(text);
        size.bytes += text.length + 1;
      }
      continue;
    }
    // Group rules (media, supports, layer, container) — recurse, and if
    // any inner rule matched, wrap the inner output in the group prelude.
    const grouping = rule as unknown as {
      cssRules?: CSSRuleList;
      conditionText?: string;
      name?: string;
    };
    if (grouping.cssRules) {
      const inner: string[] = [];
      const innerSize = { bytes: 0, cap: size.cap - size.bytes };
      walkRules(grouping.cssRules, root, inner, innerSize);
      if (inner.length > 0) {
        const prelude = preludeFor(rule);
        const wrapped = `${prelude} { ${inner.join(" ")} }`;
        out.push(wrapped);
        size.bytes += wrapped.length + 1;
      }
      continue;
    }
    // Other rules (font-face, keyframes) — keep them, they're commonly
    // referenced by matching rules and don't bloat much.
    if (
      rule.type === 5 /* FONT_FACE_RULE */ ||
      rule.type === 7 /* KEYFRAMES_RULE */
    ) {
      const text = rule.cssText;
      out.push(text);
      size.bytes += text.length + 1;
    }
  }
}

function preludeFor(rule: CSSRule): string {
  // We don't want to use `cssText` because that includes the body — and
  // we're rebuilding the body from filtered inner rules. Build the prelude
  // by hand for the common @-rules.
  const r = rule as unknown as {
    type: number;
    media?: { mediaText?: string };
    conditionText?: string;
    name?: string;
  };
  switch (r.type) {
    case 4 /* MEDIA_RULE */:
      return `@media ${r.media?.mediaText ?? "all"}`;
    case 12 /* SUPPORTS_RULE */:
      return `@supports ${r.conditionText ?? "all"}`;
    case 13 /* CONTAINER_RULE — not in lib.dom but emitted as such */:
      return `@container ${r.conditionText ?? ""}`;
    case 15 /* LAYER_BLOCK_RULE */:
      return `@layer ${r.name ?? ""}`;
    default:
      // Best-effort fallback: take everything before the first `{`.
      return rule.cssText.replace(/\{[\s\S]*$/, "").trim();
  }
}

/**
 * Capture matched CSS for `root` from `doc`'s styleSheets. Safe to call in
 * any browser context (the extension picker runs this from the content
 * script before sending the draft to the background worker).
 */
export function captureMatchedCss(
  root: Element,
  doc: DocumentLike,
  opts: CaptureCssOptions = {},
): CaptureCssResult {
  const cap = opts.maxBytes ?? 256 * 1024;
  const out: string[] = [];
  const size = { bytes: 0, cap };
  const skipped: string[] = [];
  const sheets = doc.styleSheets;
  for (let i = 0; i < sheets.length; i++) {
    if (size.bytes >= cap) break;
    const sheet = sheets[i]!;
    let rules: CSSRuleList | undefined;
    try {
      rules = sheet.cssRules;
    } catch {
      skipped.push(sheet.href ?? "(inline)");
      continue;
    }
    if (!rules) continue;
    walkRules(rules, root, out, size);
  }
  return {
    css: out.join("\n"),
    skipped,
    truncated: size.bytes >= cap,
  };
}
