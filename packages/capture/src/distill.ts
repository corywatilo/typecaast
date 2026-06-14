import { sanitizeHtml } from "./sanitize.js";
import { extractTokens } from "./tokens.js";
import type { SkinDraft, SlotReport } from "./draft.js";

/**
 * The distiller (PLAN §10): given a chat-UI subtree, produce a sanitized,
 * slotted `SkinDraft`. The pipeline is
 *
 *   clone → inline computed styles (live capture) → drop hidden/`data-*` →
 *   sanitize (allowlist) → find the repeating message row → slot-ify
 *   (author/avatar/body/time) → carve the frame chrome → find the composer →
 *   extract tokens → report.
 *
 * Capture gets you ~80% of the way; the emitted `detection` report and
 * `warnings` tell the author exactly what to confirm by hand (the §10 quality
 * bar treats anything below the bar as "draft only", never a finished skin).
 * The function is DOM-agnostic — the extension passes a live element, the
 * saved-page importer passes a jsdom element.
 */

interface WindowLike {
  document: Document;
  getComputedStyle?: (el: Element) => CSSStyleDeclaration;
}

export interface DistillOptions {
  /** DOM window (defaults to global `window`). Required in Node. */
  window?: WindowLike;
  /** Display name for the draft. */
  name?: string;
  sourceUrl?: string;
  theme?: "light" | "dark";
  /**
   * Inline computed styles from the live page so fidelity survives losing the
   * cascade. Off for saved-page import (the source CSS comes inline already).
   */
  inlineComputedStyles?: boolean;
}

/** The slot-marker attribute the `TemplateSkinAdapter` keys off. */
export const SLOT_ATTR = "data-tc-slot";

/** Computed properties worth inlining — look, not frozen layout geometry. */
const INLINE_PROPS = [
  "color",
  "background-color",
  "background",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "border",
  "border-radius",
  "padding",
  "margin",
  "gap",
  "display",
  "flex-direction",
  "align-items",
  "justify-content",
  "box-shadow",
  "opacity",
];

const HIDDEN_CLASS_RE = /\b(sr-only|visually-hidden|hidden)\b/;

function getWindow(win?: WindowLike): WindowLike {
  if (win) return win;
  if (typeof window !== "undefined") return window as unknown as WindowLike;
  throw new Error("distill requires a DOM window — pass { window } in Node.");
}

function isHidden(el: Element, win: WindowLike): boolean {
  if (el.getAttribute("aria-hidden") === "true") return true;
  if (el.hasAttribute("hidden")) return true;
  const cls = el.getAttribute("class") ?? "";
  if (HIDDEN_CLASS_RE.test(cls)) return true;
  const inline = (el.getAttribute("style") ?? "").toLowerCase();
  if (/display\s*:\s*none/.test(inline)) return true;
  if (/visibility\s*:\s*hidden/.test(inline)) return true;
  const cs = win.getComputedStyle?.(el);
  if (cs) {
    if (cs.display === "none") return true;
    if (cs.visibility === "hidden") return true;
  }
  return false;
}

function inlineStyles(orig: Element, clone: Element, win: WindowLike): void {
  const cs = win.getComputedStyle?.(orig);
  if (!cs) return;
  const decls: string[] = [];
  for (const prop of INLINE_PROPS) {
    const v = cs.getPropertyValue(prop);
    if (v && v !== "none" && v !== "normal" && v.trim() !== "")
      decls.push(`${prop}: ${v}`);
  }
  if (decls.length) clone.setAttribute("style", decls.join("; "));
}

/** Recursively inline styles + drop hidden nodes, walking orig/clone in step. */
function pruneAndInline(
  orig: Element,
  clone: Element,
  win: WindowLike,
  inline: boolean,
  dropped: { count: number },
): void {
  if (inline) inlineStyles(orig, clone, win);
  // Strip data-* (defense-in-depth; sanitize also does this later).
  for (const attr of [...clone.attributes]) {
    if (attr.name.startsWith("data-")) clone.removeAttribute(attr.name);
  }
  const origKids = [...orig.children];
  const cloneKids = [...clone.children];
  const remove: Element[] = [];
  for (let i = 0; i < origKids.length; i++) {
    const o = origKids[i];
    const c = cloneKids[i];
    if (!o || !c) continue;
    if (isHidden(o, win)) {
      remove.push(c);
      dropped.count++;
      continue;
    }
    pruneAndInline(o, c, win, inline, dropped);
  }
  for (const c of remove) c.remove();
}

/** A structural signature for grouping repeated rows. */
function signature(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const classes = (el.getAttribute("class") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(".");
  const kidTags = [...el.children]
    .map((c) => c.tagName.toLowerCase())
    .join(",");
  return `${tag}|${classes}|${kidTags}`;
}

interface RepeatPick {
  container: Element;
  rows: Element[];
}

/** Find the container whose children are the most-repeated similar rows. */
function findRepeatingRows(root: Element): RepeatPick | null {
  let best: RepeatPick | null = null;
  let bestScore = 0;
  const visit = (el: Element) => {
    const groups = new Map<string, Element[]>();
    for (const child of el.children) {
      const sig = signature(child);
      const arr = groups.get(sig) ?? [];
      arr.push(child);
      groups.set(sig, arr);
    }
    for (const rows of groups.values()) {
      if (rows.length < 2) continue;
      // Score: repetition count weighted by how much text the rows carry, so
      // a list of message bubbles beats e.g. a repeated row of icon buttons.
      const textLen = rows.reduce(
        (n, r) => n + (r.textContent ?? "").trim().length,
        0,
      );
      const score = rows.length * 10 + Math.min(textLen, 400);
      if (score > bestScore) {
        bestScore = score;
        best = { container: el, rows };
      }
    }
    for (const child of el.children) visit(child);
  };
  visit(root);
  return best;
}

const AUTHOR_RE =
  /\b(name|author|sender|user|handle|username|display-?name)\b/i;
const AVATAR_RE = /\b(avatar|photo|userpic|profile-?pic|pic|gravatar)\b/i;
const TIME_RE = /\b(time|timestamp|date|ago|sent-?at)\b/i;
const BODY_RE = /\b(body|text|content|message|bubble|markdown|prose)\b/i;
const TIME_TEXT_RE =
  /^\s*(\d{1,2}:\d{2}(\s?[ap]\.?m\.?)?|\d+\s*(m|min|h|hr|d|days?|hours?|minutes?)( ago)?|yesterday|today)\s*$/i;

function classOf(el: Element): string {
  return el.getAttribute("class") ?? "";
}

function markSlot(el: Element, slot: string, token: string): void {
  el.setAttribute(SLOT_ATTR, slot);
  el.textContent = token;
}

/** Identify and mark author/avatar/body/time inside a representative row. */
function slotifyRow(row: Element): {
  html: string;
  detected: string[];
} {
  const detected: string[] = [];
  const all = [...row.querySelectorAll("*")];

  // Avatar: an <img> or an element whose class names it.
  let avatar =
    row.querySelector("img") ??
    all.find((e) => AVATAR_RE.test(classOf(e))) ??
    null;
  if (avatar) {
    // Convert an <img> avatar into a styled container we can fill.
    if (avatar.tagName === "IMG") {
      const div = row.ownerDocument.createElement("div");
      const cls = classOf(avatar);
      if (cls) div.setAttribute("class", cls);
      const st = avatar.getAttribute("style");
      if (st) div.setAttribute("style", st);
      avatar.replaceWith(div);
      avatar = div;
    }
    markSlot(avatar, "avatar", "{{avatar}}");
    detected.push("avatar");
  }

  // Author: a named element, else the first short bold-ish text run.
  let author = all.find(
    (e) =>
      e !== avatar &&
      AUTHOR_RE.test(classOf(e)) &&
      (e.textContent ?? "").trim(),
  );
  if (!author) {
    author = all.find((e) => {
      if (e === avatar || e.getAttribute(SLOT_ATTR)) return false;
      const t = (e.textContent ?? "").trim();
      const fw = (e.getAttribute("style") ?? "").match(
        /font-weight:\s*(\d+|bold)/i,
      );
      const bold =
        e.tagName === "B" ||
        e.tagName === "STRONG" ||
        (fw ? fw[1] === "bold" || Number(fw[1]) >= 600 : false);
      return bold && t.length > 0 && t.length < 40;
    });
  }
  if (author && !author.getAttribute(SLOT_ATTR)) {
    markSlot(author, "author", "{{author}}");
    detected.push("author");
  }

  // Time: a <time>, a named element, or an element whose text reads as a time.
  const time =
    row.querySelector("time") ??
    all.find((e) => !e.getAttribute(SLOT_ATTR) && TIME_RE.test(classOf(e))) ??
    all.find(
      (e) =>
        !e.getAttribute(SLOT_ATTR) &&
        e.children.length === 0 &&
        TIME_TEXT_RE.test((e.textContent ?? "").trim()),
    );
  if (time && !time.getAttribute(SLOT_ATTR)) {
    markSlot(time, "time", "{{time}}");
    detected.push("time");
  }

  // Body: the remaining element with the most text (or a named one). Never an
  // ancestor of an already-marked slot, or filling it would wipe author/time.
  const named = all.find(
    (e) =>
      !e.getAttribute(SLOT_ATTR) &&
      !e.querySelector(`[${SLOT_ATTR}]`) &&
      BODY_RE.test(classOf(e)),
  );
  let body = named ?? null;
  if (!body) {
    let bestLen = -1;
    for (const e of all) {
      if (e.getAttribute(SLOT_ATTR)) continue;
      if (e.querySelector(`[${SLOT_ATTR}]`)) continue; // don't pick an ancestor of a slot
      const t = (e.textContent ?? "").trim();
      if (t.length > bestLen) {
        bestLen = t.length;
        body = e;
      }
    }
  }
  if (body && !body.getAttribute(SLOT_ATTR)) {
    markSlot(body, "body", "{{body}}");
    detected.push("body");
  } else if (!body) {
    // Fall back: slot the row itself.
    markSlot(row, "body", "{{body}}");
    detected.push("body");
  }

  return { html: row.outerHTML, detected };
}

const COMPOSER_RE =
  /\b(composer|compose|reply|message-?box|message-?input|input-?box|textbox|editor|prompt)\b/i;

function findComposer(root: Element, exclude: Element): Element | null {
  const candidates = [...root.querySelectorAll("*")].filter(
    (e) => !exclude.contains(e) && !e.contains(exclude),
  );
  return (
    candidates.find((e) => e.getAttribute("role") === "textbox") ??
    candidates.find((e) => e.hasAttribute("contenteditable")) ??
    candidates.find((e) => COMPOSER_RE.test(classOf(e))) ??
    null
  );
}

function emptyReport(): SlotReport {
  return { found: false, detected: [], confidence: 0 };
}

export function distill(root: Element, opts: DistillOptions = {}): SkinDraft {
  const win = getWindow(opts.window);
  const doc = win.document;
  const warnings: string[] = [];

  // 1. Clone, inline styles, drop hidden + data-*.
  const clone = root.cloneNode(true) as Element;
  const dropped = { count: 0 };
  pruneAndInline(root, clone, win, opts.inlineComputedStyles ?? false, dropped);
  if (dropped.count > 0)
    warnings.push(
      `Dropped ${dropped.count} hidden element(s) from the capture.`,
    );

  // 2. Sanitize (allowlist) and re-parse.
  const safe = sanitizeHtml(clone.outerHTML, { window: win });
  const host = doc.createElement("div");
  host.innerHTML = safe;
  const frameRoot = (host.firstElementChild as Element | null) ?? host;

  // 3. Find the repeating message row.
  const pick = findRepeatingRows(frameRoot);
  const detection = {
    frame: emptyReport(),
    message: emptyReport(),
    composer: emptyReport(),
    typing: emptyReport(),
  };

  let messageHtml: string | undefined;
  let frameHtml: string | undefined;
  let composerHtml: string | undefined;

  if (pick) {
    // 4. Slot-ify a representative row.
    const sample = (pick.rows[0] as Element).cloneNode(true) as Element;
    const slotted = slotifyRow(sample);
    messageHtml = slotted.html;
    detection.message = {
      found: true,
      detected: slotted.detected,
      confidence: Math.min(1, slotted.detected.length / 4),
    };

    // 5. Carve the frame: replace the message list with a {{messages}} slot.
    const slot = doc.createElement("div");
    slot.setAttribute(SLOT_ATTR, "messages");
    slot.textContent = "{{messages}}";
    const listCls = classOf(pick.container);
    if (listCls) slot.setAttribute("class", `${listCls} tc-messages`);
    const containerClone = pick.container.cloneNode(false) as Element;
    // Preserve the list container's own styling, but it now holds only the slot.
    if (containerClone.getAttribute("style"))
      slot.setAttribute(
        "style",
        containerClone.getAttribute("style") as string,
      );
    // Build the frame by replacing the container subtree with the slot.
    const frameClone = frameRoot.cloneNode(true) as Element;
    const path = pathTo(frameRoot, pick.container);
    const targetInClone = path ? nodeAtPath(frameClone, path) : null;
    if (targetInClone && targetInClone.parentElement) {
      targetInClone.replaceWith(slot);
      frameHtml = frameClone.outerHTML;
      detection.frame = { found: true, detected: ["messages"], confidence: 1 };
    } else {
      // The list *is* the root; frame is just the slot.
      frameHtml = slot.outerHTML;
      detection.frame = {
        found: true,
        detected: ["messages"],
        confidence: 0.5,
      };
      warnings.push(
        "Message list is the captured root; no surrounding chrome was found.",
      );
    }

    // 6. Composer (outside the message list).
    const composer = findComposer(frameRoot, pick.container);
    if (composer) {
      const c = composer.cloneNode(true) as Element;
      c.setAttribute(SLOT_ATTR, "composer");
      c.removeAttribute("contenteditable");
      c.textContent = "{{composer}}";
      composerHtml = c.outerHTML;
      detection.composer = {
        found: true,
        detected: ["composer"],
        confidence: 1,
      };
    } else {
      warnings.push(
        "No composer detected — add one by hand if the skin needs it.",
      );
    }
  } else {
    warnings.push(
      "No repeating message row found — capture a tighter subtree around the thread.",
    );
  }

  // 7. Tokens.
  const tokens = extractTokens(frameRoot);

  // 8. Canvas suggestion from the captured box (best effort).
  let canvas: { width: number; height: number } | undefined;
  const rect = (
    root as Element & { getBoundingClientRect?: () => DOMRect }
  ).getBoundingClientRect?.();
  if (rect && rect.width > 0 && rect.height > 0) {
    canvas = { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  return {
    version: 1,
    meta: {
      name: opts.name ?? "Captured skin",
      ...(opts.sourceUrl ? { sourceUrl: opts.sourceUrl } : {}),
      ...(opts.theme ? { theme: opts.theme } : {}),
      ...(canvas ? { canvas } : {}),
    },
    slots: {
      ...(frameHtml ? { frame: frameHtml } : {}),
      ...(messageHtml ? { message: messageHtml } : {}),
      ...(composerHtml ? { composer: composerHtml } : {}),
    },
    css: "",
    tokens,
    detection,
    warnings,
  };
}

/** Index path from `root` down to `target` (list of child indices). */
function pathTo(root: Element, target: Element): number[] | null {
  if (root === target) return [];
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (!child) continue;
    const sub = pathTo(child, target);
    if (sub) return [i, ...sub];
  }
  return null;
}

function nodeAtPath(root: Element, path: number[]): Element | null {
  let node: Element | null = root;
  for (const i of path) {
    if (!node) return null;
    node = node.children[i] ?? null;
  }
  return node;
}
