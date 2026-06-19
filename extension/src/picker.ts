import { captureMatchedCss, distill } from "@typecaast/capture";
import type { ExtMessage } from "./messages.js";

/**
 * The element picker (injected on demand by the popup). Hover to highlight a
 * candidate, click to capture: it runs the **same distiller** the saved-page
 * importer uses — here against the live DOM with computed styles inlined — and
 * hands the resulting `SkinDraft` to the service worker to save locally. No
 * network, ever (PLAN §10/§18: capture is local-first).
 *
 * Bundled as a classic content script (IIFE); guard against double-injection.
 */

declare global {
  interface Window {
    __tcPickerActive?: boolean;
  }
}

function slugifyHost(): string {
  return location.hostname.replace(/^www\./, "").replace(/[^a-z0-9]+/gi, "-");
}

function startPicker(): void {
  if (window.__tcPickerActive) return;
  window.__tcPickerActive = true;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "2147483647",
    border: "2px solid #5b5bd6",
    background: "rgba(91,91,214,0.12)",
    borderRadius: "4px",
    transition: "none",
    display: "none",
  } satisfies Partial<CSSStyleDeclaration>);

  const hint = document.createElement("div");
  Object.assign(hint.style, {
    position: "fixed",
    top: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    background: "#5b5bd6",
    color: "#fff",
    font: "13px -apple-system, system-ui, sans-serif",
    padding: "6px 12px",
    borderRadius: "999px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
  } satisfies Partial<CSSStyleDeclaration>);
  hint.textContent = "Click the chat thread to capture · Esc to cancel";

  document.body.append(overlay, hint);

  let current: Element | null = null;

  const onMove = (e: MouseEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el === overlay || el === hint) return;
    current = el;
    const r = el.getBoundingClientRect();
    Object.assign(overlay.style, {
      display: "block",
      top: `${r.top}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
  };

  const teardown = () => {
    window.__tcPickerActive = false;
    overlay.remove();
    hint.remove();
    document.removeEventListener("mousemove", onMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
  };

  const onClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = current;
    teardown();
    if (!target) return;
    capture(target);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") teardown();
  };

  document.addEventListener("mousemove", onMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKey, true);
}

function capture(target: Element): void {
  // Capture matched CSS *before* distill — the captured subtree's class
  // attributes lose their meaning when they leave the page's stylesheet.
  // We embed the matched rules in draft.css so the slot-template renderer
  // can re-apply them inside the shadow root.
  const cssCapture = captureMatchedCss(target, document);
  const draft = distill(target, {
    inlineComputedStyles: true,
    sourceUrl: location.href,
    name: document.title || slugifyHost(),
    css: cssCapture.css,
    cssSkipped: cssCapture.skipped.length ? cssCapture.skipped : undefined,
    capturedAt: {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    },
  });
  const json = JSON.stringify(draft, null, 2);
  const detected = draft.detection.message.detected;
  const cssNote = cssCapture.truncated ? " (css truncated)" : "";
  const summary = draft.detection.message.found
    ? `Captured ${detected.length} slot(s): ${detected.join(", ") || "none"}${cssNote}`
    : "No message row detected — try a tighter selection.";
  const message: ExtMessage = {
    type: "tc-capture",
    filename: `${slugifyHost()}-skin-draft.json`,
    json,
    draft,
  };
  chrome.runtime.sendMessage(message);
  chrome.runtime.sendMessage({
    type: "tc-picked",
    ok: draft.detection.message.found,
    summary,
  } satisfies ExtMessage);
}

// Injected to begin immediately.
startPicker();
