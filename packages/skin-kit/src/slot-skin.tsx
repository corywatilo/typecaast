/**
 * `slotSkinFromDraft` — build a `Skin` from a slotted HTML draft (the shape
 * the capture pipeline emits). The frame/message/composer HTML strings are
 * injected into a shadow root with the draft's CSS, and `{{slot}}` markers
 * are substituted with per-message text at render time.
 *
 * Lives in `@typecaast/skin-kit` so both `@typecaast/capture` (the runtime
 * untrusted-template path) and `@typecaast/skins` (built-in captured skins
 * like PostHog) can share one implementation without forming a build cycle
 * with `@typecaast/react`. The capture-runtime caller layers `sanitizeHtml`
 * around it; built-ins skip sanitize because their draft.json is
 * version-controlled.
 *
 * Responsive behaviour: the captured DOM is typically taken on a desktop
 * viewport (1000-1500px wide) but the skin renders into a small canvas
 * (often 480×640). We normalise that by:
 *   - wrapping the frame slot in a container that is `width:100%; height:100%`
 *     with `overflow:hidden`, so the captured outer chrome can't extend
 *     past the canvas;
 *   - resetting the captured root element's `margin`/`max-width` so a
 *     `margin: 0px 234px` baked in at desktop width becomes `margin: 0 auto`;
 *   - exposing the captured viewport width as `--captured-viewport-width`
 *     for authored CSS to ratio-scale against if it wants.
 */
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ContentNode, Participant } from "@typecaast/schema";
import type {
  Capabilities,
  ComposerProps,
  FrameProps,
  MessageProps,
  SystemProps,
  TypingProps,
} from "@typecaast/core";
import type { Skin, SkinComponents, SkinTokens } from "./types.js";

const SLOT_ATTR = "data-tc-slot";

interface TokenSet {
  colors?: Record<string, string>;
}

export interface SlotSkinDraft {
  meta: {
    name: string;
    theme?: "light" | "dark";
    canvas?: { width: number; height: number };
    capturedAt?: { viewportWidth?: number; pixelRatio?: number };
  };
  slots: {
    frame?: string;
    message?: string;
    composer?: string;
    typing?: string;
    system?: string;
  };
  css?: string;
  tokens: TokenSet;
  darkTokens?: TokenSet;
}

export interface SlotSkinOptions {
  id: string;
  capabilities: Capabilities;
  /**
   * When true, every slot mount in the shadow root gets a faint dashed
   * outline + a corner badge naming the slot. Used by the `/create-skin`
   * editor to show authors where their `{{body}}` lands.
   */
  slotMarkers?: boolean;
}

function contentToText(content: ContentNode[]): string {
  const out: string[] = [];
  for (const node of content) {
    if (
      node.type === "text" &&
      Array.isArray((node as { spans?: unknown }).spans)
    ) {
      for (const span of (
        node as { spans: { value?: string; label?: string }[] }
      ).spans) {
        out.push(span.value ?? span.label ?? "");
      }
    } else if (node.type === "image") {
      out.push((node as { alt?: string }).alt ?? "🖼");
    }
  }
  return out.join("");
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function fmtTime(atMs: number): string {
  const total = Math.floor(atMs / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Build the `<style>` text for the shadow root. Order matters:
 *   1. `:host` declarations (tokens as CSS vars, captured viewport width).
 *   2. A reset that normalises the captured root element back to fluid
 *      layout — desktop-only `margin: 0 200px`/`max-width: 1200px` would
 *      otherwise squeeze content in a small canvas.
 *   3. Author / captured CSS, which can override anything above.
 *   4. Slot-marker overlay if requested.
 */
function styleText(
  tokens: TokenSet,
  css: string,
  capturedAt: SlotSkinDraft["meta"]["capturedAt"],
  slotMarkers: boolean,
): string {
  const vars = Object.entries(tokens.colors ?? {})
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
  const cv = capturedAt?.viewportWidth
    ? `--captured-viewport-width: ${capturedAt.viewportWidth}px;`
    : "";
  const reset = `
  :host { all: initial; display: block; width: 100%; height: 100%; ${vars} ${cv} }
  * { box-sizing: border-box; }
  /* Normalise the captured root: drop desktop-only margins / max-widths
     so the layout re-centers cleanly in any canvas. */
  .tc-slot-root > :first-child {
    margin-left: auto !important;
    margin-right: auto !important;
    max-width: 100% !important;
  }`;
  const markers = slotMarkers
    ? `
  [data-tc-slot] {
    outline: 1px dashed rgba(99, 102, 241, 0.6);
    outline-offset: -1px;
    position: relative;
  }
  [data-tc-slot]::before {
    content: attr(data-tc-slot);
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    font: 600 9px/1 -apple-system, system-ui, sans-serif;
    padding: 1px 4px;
    background: rgba(99, 102, 241, 0.95);
    color: white;
    border-radius: 2px;
    pointer-events: none;
    z-index: 10;
  }`
    : "";
  return `${reset}\n${css}\n${markers}`;
}

function fillInto(
  host: HTMLElement,
  templateHtml: string,
  values: Record<string, string>,
): void {
  host.innerHTML = templateHtml;
  for (const node of host.querySelectorAll(`[${SLOT_ATTR}]`)) {
    const slot = node.getAttribute(SLOT_ATTR);
    if (slot && slot in values) node.textContent = values[slot] ?? "";
  }
}

function revealStyle(progress: number): CSSProperties {
  const p = Math.max(0, Math.min(1, progress));
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * 6}px)`,
    willChange: "opacity, transform",
  };
}

export function slotSkinFromDraft(
  draft: SlotSkinDraft,
  opts: SlotSkinOptions,
): Skin {
  const lightTokens: SkinTokens = { colors: draft.tokens.colors ?? {} };
  const darkTokens: SkinTokens = draft.darkTokens
    ? { colors: draft.darkTokens.colors ?? {} }
    : lightTokens;
  const slotMarkers = opts.slotMarkers ?? false;
  const cssByTheme = {
    light: styleText(
      lightTokens,
      draft.css ?? "",
      draft.meta.capturedAt,
      slotMarkers,
    ),
    dark: styleText(
      darkTokens,
      draft.css ?? "",
      draft.meta.capturedAt,
      slotMarkers,
    ),
  };
  const supportsThemes: ("light" | "dark")[] = draft.darkTokens
    ? ["light", "dark"]
    : [draft.meta.theme ?? "light"];

  const frameHtml = draft.slots.frame;
  const messageHtml = draft.slots.message;
  const composerHtml = draft.slots.composer;
  const systemHtml = draft.slots.system;
  const typingHtml = draft.slots.typing;

  const Frame: FC<FrameProps & { children?: ReactNode }> = ({
    theme,
    children,
  }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
      shadow.innerHTML = "";
      const style = host.ownerDocument.createElement("style");
      style.textContent = theme === "dark" ? cssByTheme.dark : cssByTheme.light;
      shadow.appendChild(style);
      // Wrap the captured frame in a fluid 100%×100% container so any
      // desktop-fixed widths/margins on the captured root get neutralised
      // by the `.tc-slot-root > :first-child` reset.
      const wrapper = host.ownerDocument.createElement("div");
      wrapper.className = "tc-slot-root";
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.overflow = "hidden";
      wrapper.innerHTML = frameHtml ?? `<div ${SLOT_ATTR}="messages"></div>`;
      shadow.appendChild(wrapper);
      const slot =
        wrapper.querySelector<HTMLElement>(`[${SLOT_ATTR}="messages"]`) ??
        wrapper;
      slot.textContent = "";
      setMount(slot);
    }, [theme]);
    return (
      <div ref={hostRef} style={{ width: "100%", height: "100%" }}>
        {mount ? createPortal(children, mount) : null}
      </div>
    );
  };

  const Message: FC<MessageProps> = ({ message, author }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el || !messageHtml) return;
      fillInto(el, messageHtml, {
        author: author.name,
        avatar: initials(author.name),
        body: contentToText(message.content),
        time: fmtTime(message.atMs),
      });
    }, [message, author]);
    return <div ref={ref} style={revealStyle(message.revealProgress)} />;
  };

  const SystemMessage: FC<SystemProps> = ({ message }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el || !systemHtml) return;
      fillInto(el, systemHtml, { body: contentToText(message.content) });
    }, [message]);
    if (systemHtml) {
      return <div ref={ref} style={revealStyle(message.revealProgress)} />;
    }
    return (
      <div
        style={{
          ...revealStyle(message.revealProgress),
          textAlign: "center",
        }}
      >
        {contentToText(message.content)}
      </div>
    );
  };

  const TypingIndicator: FC<TypingProps> = ({ author }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el || !typingHtml) return;
      fillInto(el, typingHtml, { author: author.name });
    }, [author]);
    if (typingHtml) {
      return <div ref={ref} />;
    }
    return (
      <div style={{ opacity: 0.7, fontStyle: "italic" }}>
        {author.name} is typing…
      </div>
    );
  };

  const Composer: FC<ComposerProps> = ({ composer }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (composerHtml) {
        fillInto(el, composerHtml, { composer: composer.text });
      } else {
        el.textContent = composer.text;
      }
    }, [composer]);
    return <div ref={ref} />;
  };

  const Avatar: FC<{ participant: Participant; size?: number }> = ({
    participant,
    size = 36,
  }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: "var(--color-1, #ccc)",
        fontSize: size * 0.4,
      }}
    >
      {initials(participant.name)}
    </div>
  );

  const components: SkinComponents = {
    Frame,
    Message,
    SystemMessage,
    TypingIndicator,
    Reaction: () => null,
    Composer,
    Avatar,
  };

  return {
    id: opts.id,
    meta: {
      name: draft.meta.name,
      defaultCanvas: draft.meta.canvas ?? { width: 420, height: 720 },
      supportsThemes,
      capabilities: opts.capabilities,
    },
    components,
    tokens: { light: lightTokens, dark: darkTokens },
  };
}
