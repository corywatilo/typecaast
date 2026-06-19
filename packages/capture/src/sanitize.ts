import createDOMPurify from "dompurify";

/**
 * Allowlist sanitizer for captured / imported HTML+CSS (PLAN §10). Captured
 * markup is **untrusted** — it can carry scripts, event handlers, hostile
 * `url(javascript:)` CSS, `data:text/html` payloads, and framed content. We do
 * not roll our own: the heavy lifting is a maintained, audited sanitizer
 * (DOMPurify), wrapped here with a strict allowlist and a CSS scrubber, and the
 * `TemplateSkinAdapter` *additionally* renders in a shadow root so a sanitizer
 * miss still can't reach the host page. Defense in depth, not a single gate.
 */

interface WindowLike {
  document: Document;
}

/** Tags we keep — pure presentational/structural HTML. No scripts, forms, media. */
const ALLOWED_TAGS = [
  "div",
  "span",
  "p",
  "a",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "small",
  "sub",
  "sup",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "img",
  "svg",
  "path",
  "g",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "defs",
  "use",
  "title",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "time",
  "header",
  "footer",
  "section",
  "article",
  "aside",
  "nav",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
];

/**
 * Attributes we keep. `data-*` is dropped via `ALLOW_DATA_ATTR: false`, with the
 * single exception of our own `data-tc-slot` marker, which is re-allowed via
 * `ADD_ATTR` below so the slot contract survives a re-sanitize.
 */
const ALLOWED_ATTR = [
  "class",
  "style",
  "role",
  "contenteditable",
  "alt",
  "src",
  "srcset",
  "width",
  "height",
  "dir",
  "title",
  "viewbox",
  "fill",
  "stroke",
  "stroke-width",
  "d",
  "points",
  "cx",
  "cy",
  "r",
  "x",
  "y",
  "x1",
  "x2",
  "y1",
  "y2",
  "rx",
  "ry",
  "transform",
  "xmlns",
  "href",
];

/**
 * Strip CSS-level code execution and exfiltration vectors from a style string
 * (inline `style=""` or a stylesheet body). Inline styles survive sanitize, so
 * this is where `expression()`, `url(javascript:)`, `@import`, `behavior:`, and
 * non-image `data:` URLs are removed.
 */
export function scrubCss(css: string): string {
  let out = css;
  // Hostile functions / properties.
  out = out.replace(/expression\s*\(/gi, "/*blocked*/(");
  out = out.replace(/-moz-binding\s*:/gi, "/*blocked*/:");
  out = out.replace(/behavior\s*:/gi, "/*blocked*/:");
  out = out.replace(/@import[^;]*;?/gi, "/*blocked-import*/");
  // url(...) targets: block scripting protocols and non-image data URLs.
  out = out.replace(/url\(\s*(['"]?)([^)'"]*)\1\s*\)/gi, (whole, _q, uri) => {
    const u = String(uri).trim().toLowerCase();
    const blocked =
      u.startsWith("javascript:") ||
      u.startsWith("vbscript:") ||
      (u.startsWith("data:") && !u.startsWith("data:image/"));
    return blocked ? "none" : whole;
  });
  // Bare scripting protocols anywhere in the declaration.
  out = out.replace(/javascript:/gi, "blocked:");
  out = out.replace(/vbscript:/gi, "blocked:");
  return out;
}

function getWindow(win?: WindowLike): WindowLike {
  if (win) return win;
  if (typeof window !== "undefined") return window as unknown as WindowLike;
  throw new Error(
    "sanitizeHtml requires a DOM window — pass { window } in non-browser environments.",
  );
}

let hooked: unknown = null;

type PurifyWindow = Parameters<typeof createDOMPurify>[0];

function purifierFor(win: WindowLike): ReturnType<typeof createDOMPurify> {
  const purify = createDOMPurify(win as unknown as PurifyWindow);
  // Install hooks once per purifier instance.
  if (hooked !== purify) {
    purify.addHook("afterSanitizeAttributes", (node) => {
      const el = node as Element;
      // Scrub inline styles for CSS hazards.
      const style = el.getAttribute?.("style");
      if (style) el.setAttribute("style", scrubCss(style));
      // Enforce image-only data: URLs on src.
      const src = el.getAttribute?.("src");
      if (src) {
        const u = src.trim().toLowerCase();
        if (u.startsWith("data:") && !u.startsWith("data:image/")) {
          el.removeAttribute("src");
        }
      }
      // Force links inert and safe — no navigation out of a simulation.
      if (el.tagName === "A") {
        el.removeAttribute("href");
        el.setAttribute("role", "link");
      }
      // target=_blank/opener hygiene (belt-and-braces; href already removed).
      if (el.getAttribute?.("target")) el.removeAttribute("target");
    });
    hooked = purify;
  }
  return purify;
}

export interface SanitizeOptions {
  /** DOM window to use (required in Node; defaults to global `window`). */
  window?: WindowLike;
}

/**
 * Sanitize an untrusted HTML string to the capture allowlist. Returns inert,
 * presentational HTML safe to parse and slot-ify. Always pair with shadow-DOM
 * isolation at render time (`TemplateSkinAdapter`).
 */
export function sanitizeHtml(html: string, opts: SanitizeOptions = {}): string {
  const win = getWindow(opts.window);
  const purify = purifierFor(win);
  return purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Keep our slot marker even though data-* is otherwise dropped, and
    // keep `contenteditable` so the composer-detection heuristic can find
    // div-based composers (Slack/PostHog/etc. fake the textarea with a
    // contenteditable div). The distiller strips it later, after marking.
    ADD_ATTR: ["data-tc-slot", "contenteditable"],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: true,
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "link",
      "meta",
      "base",
      "video",
      "audio",
      "source",
    ],
    FORBID_ATTR: ["srcdoc", "formaction", "xlink:href"],
  }) as string;
}
