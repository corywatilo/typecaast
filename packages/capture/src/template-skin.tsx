import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { ContentNode } from "@typecaast/schema";
import type { Participant } from "@typecaast/schema";
import type {
  Capabilities,
  ComposerProps,
  FrameProps,
  MessageProps,
  SystemProps,
  TypingProps,
} from "@typecaast/core";
import type { Skin, SkinComponents, SkinTokens } from "@typecaast/skin-kit";
import { sanitizeHtml } from "./sanitize.js";
import { SLOT_ATTR } from "./distill.js";
import type { SkinDraft } from "./draft.js";

/**
 * `TemplateSkinAdapter` — make a captured `SkinDraft` satisfy the `Skin`
 * contract by filling its slots at render time (PLAN §10). Template skins are
 * **untrusted regardless of source**, so the adapter (a) re-sanitizes every
 * template string and (b) renders inside an **open shadow root** at the Frame,
 * so even a sanitizer miss can't restyle or script the host page. Slot text is
 * written via `textContent` (never `innerHTML`), so authored content can't
 * inject markup either.
 *
 * This is a faithful *playback* of the capture, not the final hand-tuned skin —
 * `typecaast scaffold-skin` turns the same draft into an editable React skin.
 */

export interface TemplateSkinOptions {
  /** Override the skin id (defaults to a slug of the draft name). */
  id?: string;
  capabilities?: Capabilities;
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "captured"
  );
}

/** Flatten a message body to plain text (the draft adapter renders text only). */
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

/** Build the `<style>` text for the shadow root from draft tokens + extra CSS. */
function styleText(tokens: SkinTokens, css: string): string {
  const vars = Object.entries(tokens.colors ?? {})
    .map(([k, v]) => `--${k}: ${v};`)
    .join(" ");
  return `:host{all:initial; display:block; width:100%; height:100%; ${vars}}
  *{box-sizing:border-box;}
  ${css}`;
}

/** Fill a sanitized template's slots into `host` via safe textContent writes. */
function fillInto(
  host: HTMLElement,
  templateHtml: string,
  values: Record<string, string>,
): void {
  host.innerHTML = templateHtml; // templateHtml is pre-sanitized at skin build
  for (const node of host.querySelectorAll(`[${SLOT_ATTR}]`)) {
    const slot = node.getAttribute(SLOT_ATTR);
    if (slot && slot in values) node.textContent = values[slot] ?? "";
  }
}

/** progress-driven fade+slide (no CSS transitions — frame-parity, PLAN §8). */
function revealStyle(progress: number): CSSProperties {
  const p = Math.max(0, Math.min(1, progress));
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * 6}px)`,
    willChange: "opacity, transform",
  };
}

const DEFAULT_CAPS: Capabilities = {
  events: {},
  content: {},
  reactions: false,
  threads: false,
  readReceipts: false,
};

export function templateSkinFromDraft(
  draft: SkinDraft,
  opts: TemplateSkinOptions = {},
): Skin {
  // Re-sanitize every template once, up front (untrusted regardless of source).
  const safe = {
    frame: draft.slots.frame ? sanitizeHtml(draft.slots.frame) : undefined,
    message: draft.slots.message
      ? sanitizeHtml(draft.slots.message)
      : undefined,
    composer: draft.slots.composer
      ? sanitizeHtml(draft.slots.composer)
      : undefined,
  };
  const tokens: SkinTokens = { colors: draft.tokens.colors ?? {} };
  const css = styleText(tokens, draft.css ?? "");
  const theme = draft.meta.theme ?? "light";

  const Frame: FC<FrameProps & { children?: ReactNode }> = ({ children }) => {
    const hostRef = useRef<HTMLDivElement>(null);
    const [mount, setMount] = useState<HTMLElement | null>(null);
    useLayoutEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
      shadow.innerHTML = "";
      const style = host.ownerDocument.createElement("style");
      style.textContent = css;
      shadow.appendChild(style);
      const wrapper = host.ownerDocument.createElement("div");
      wrapper.style.width = "100%";
      wrapper.style.height = "100%";
      wrapper.innerHTML = safe.frame ?? `<div ${SLOT_ATTR}="messages"></div>`;
      shadow.appendChild(wrapper);
      const slot =
        wrapper.querySelector<HTMLElement>(`[${SLOT_ATTR}="messages"]`) ??
        wrapper;
      slot.textContent = "";
      setMount(slot);
    }, []);
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
      if (!el || !safe.message) return;
      fillInto(el, safe.message, {
        author: author.name,
        avatar: initials(author.name),
        body: contentToText(message.content),
        time: fmtTime(message.atMs),
      });
    }, [message, author]);
    return <div ref={ref} style={revealStyle(message.revealProgress)} />;
  };

  const SystemMessage: FC<SystemProps> = ({ message }) => (
    <div
      style={{ ...revealStyle(message.revealProgress), textAlign: "center" }}
    >
      {contentToText(message.content)}
    </div>
  );

  const TypingIndicator: FC<TypingProps> = ({ author }) => (
    <div style={{ opacity: 0.7, fontStyle: "italic" }}>
      {author.name} is typing…
    </div>
  );

  const Composer: FC<ComposerProps> = ({ composer }) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (safe.composer) {
        fillInto(el, safe.composer, { composer: composer.text });
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
    id: opts.id ?? slug(draft.meta.name),
    meta: {
      name: draft.meta.name,
      defaultCanvas: draft.meta.canvas ?? { width: 420, height: 720 },
      supportsThemes: [theme],
      capabilities: opts.capabilities ?? DEFAULT_CAPS,
    },
    components,
    tokens: { light: tokens, dark: tokens },
  };
}
