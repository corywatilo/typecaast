import { JSDOM } from "jsdom";
import { distill, type DistillOptions } from "./distill.js";
import type { SkinDraft } from "./draft.js";

/**
 * Saved-page importer (PLAN §10) — the Node counterpart to the extension. It
 * ingests a saved `.html`/`.mhtml` file, parses it in a jsdom window, picks the
 * thread subtree (by selector or a best-effort guess), and runs the **same
 * distiller** the extension does, so both paths converge on one `SkinDraft`.
 *
 * Lives behind the `@typecaast/capture/import` entry so the browser bundle never
 * pulls in jsdom.
 */

export interface ImportOptions extends Omit<DistillOptions, "window"> {
  /** CSS selector for the thread root; otherwise a heuristic guess is used. */
  selector?: string;
}

/** Strip MHTML quoted-printable framing down to the HTML part, best effort. */
function mhtmlToHtml(raw: string): string {
  // Find the first text/html part.
  const idx = raw.search(/Content-Type:\s*text\/html/i);
  if (idx === -1) return raw;
  let body = raw.slice(idx);
  // Skip to the blank line after the part headers.
  const start = body.search(/\r?\n\r?\n/);
  if (start !== -1) body = body.slice(start + 2);
  // Cut at the next MIME boundary.
  const boundary = body.search(/\r?\n--/);
  if (boundary !== -1) body = body.slice(0, boundary);
  // Decode quoted-printable soft breaks + =XX escapes.
  body = body.replace(/=\r?\n/g, "");
  body = body.replace(/=([0-9A-Fa-f]{2})/g, (_m, hex: string) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
  return body;
}

const THREAD_GUESS = [
  '[role="log"]',
  '[role="list"]',
  '[aria-label*="message" i]',
  '[class*="message-list" i]',
  '[class*="messages" i]',
  '[class*="thread" i]',
  '[class*="conversation" i]',
  "main",
];

function guessThread(doc: Document): Element {
  for (const sel of THREAD_GUESS) {
    const el = doc.querySelector(sel);
    if (el) return el;
  }
  return doc.body;
}

/**
 * Parse saved-page markup and distill it. `content` is the file's text; set
 * `mhtml` when importing a `.mhtml` archive.
 */
export function importHtml(
  content: string,
  opts: ImportOptions & { mhtml?: boolean } = {},
): SkinDraft {
  const html = opts.mhtml ? mhtmlToHtml(content) : content;
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const root = opts.selector
    ? (doc.querySelector(opts.selector) ?? guessThread(doc))
    : guessThread(doc);
  const { selector: _selector, mhtml: _mhtml, ...rest } = opts;
  void _selector;
  void _mhtml;
  return distill(root, {
    ...rest,
    window: dom.window as unknown as DistillOptions["window"],
    name: rest.name ?? doc.title ?? "Imported skin",
    // Saved pages carry their styles inline/in <style>; don't compute.
    inlineComputedStyles: false,
  });
}
