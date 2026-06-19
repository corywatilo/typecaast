import { slotSkinFromDraft, type SlotSkinDraft } from "@typecaast/skin-kit";
import type { Skin } from "@typecaast/skin-kit";
import type { Capabilities } from "@typecaast/core";

export interface EditorState {
  name: string;
  frame: string;
  message: string;
  composer: string;
  system: string;
  typing: string;
  css: string;
  /** Plain JSON for tokens — `{ "colors": { ... } }`. */
  tokensJson: string;
  /** Plain JSON for darkTokens (optional). */
  darkTokensJson: string;
  /** Plain JSON matching the `Capabilities` shape. */
  capabilitiesJson: string;
  slotMarkers: boolean;
}

/**
 * The default editor state — what a fresh `/create-skin` session starts with.
 * A minimal "hello world" of a skin: a centered bubble for each message and a
 * simple composer at the bottom. Enough to show that the slot system works.
 */
export const DEFAULT_STATE: EditorState = {
  name: "My new skin",
  frame: `<div data-tc-slot="messages" style="display:flex; flex-direction:column; padding:12px; gap:8px; overflow-y:auto"></div>`,
  message: `<div style="background:var(--bubble); color:var(--bubbleText); padding:8px 12px; border-radius:14px; max-width:78%; align-self:flex-start">
  <div style="font-weight:600; font-size:12px; opacity:0.7" data-tc-slot="author">{{author}}</div>
  <div data-tc-slot="body" style="font-size:14px; line-height:1.45">{{body}}</div>
</div>`,
  composer: `<div style="padding:10px 12px; border-top:1px solid var(--border); display:flex; align-items:center; gap:8px">
  <div data-tc-slot="composer" style="flex:1; padding:6px 10px; border-radius:8px; background:var(--inputBg); color:var(--text)">{{composer}}</div>
</div>`,
  system: ``,
  typing: ``,
  css: `:host { --bubble: rgba(59,130,246,0.12); --bubbleText: #111827; --border: rgba(0,0,0,0.1); --inputBg: #f3f4f6; --text: #111827; }`,
  tokensJson: JSON.stringify(
    {
      colors: {
        bg: "#ffffff",
        text: "#111827",
        accent: "#3b82f6",
      },
    },
    null,
    2,
  ),
  darkTokensJson: JSON.stringify(
    {
      colors: {
        bg: "#0b0d12",
        text: "#e5e7eb",
        accent: "#60a5fa",
      },
    },
    null,
    2,
  ),
  capabilitiesJson: JSON.stringify(
    {
      events: {
        message: "native",
        composerType: "native",
        send: "native",
        typing: "fallback",
        delay: "native",
        system: "fallback",
        reaction: "unsupported",
        edit: "unsupported",
        delete: "unsupported",
        readReceipt: "unsupported",
      },
      content: { text: true, image: false },
      reactions: false,
      threads: false,
      readReceipts: false,
    },
    null,
    2,
  ),
  slotMarkers: false,
};

function tryParseJson<T>(raw: string, fallback: T): T {
  try {
    const v = JSON.parse(raw);
    return v as T;
  } catch {
    return fallback;
  }
}

/**
 * Compile the editor's state into a `Skin` for the live preview. Tolerant of
 * partially-typed JSON / HTML — empty strings just mean "no template for that
 * slot", and invalid JSON falls back to the prior parsed state.
 */
export function buildSkin(state: EditorState): {
  skin: Skin;
  errors: string[];
} {
  const errors: string[] = [];

  let tokens: { colors?: Record<string, string> } = {};
  try {
    tokens = JSON.parse(state.tokensJson || "{}");
  } catch (err) {
    errors.push(`Tokens JSON: ${(err as Error).message}`);
    tokens = {};
  }

  let darkTokens: { colors?: Record<string, string> } | undefined;
  if (state.darkTokensJson.trim()) {
    try {
      darkTokens = JSON.parse(state.darkTokensJson);
    } catch (err) {
      errors.push(`Dark tokens JSON: ${(err as Error).message}`);
    }
  }

  const capabilities = tryParseJson<Capabilities>(
    state.capabilitiesJson,
    DEFAULT_CAPABILITIES,
  );

  const draft: SlotSkinDraft = {
    meta: { name: state.name || "Untitled" },
    slots: {
      frame: state.frame || undefined,
      message: state.message || undefined,
      composer: state.composer || undefined,
      system: state.system || undefined,
      typing: state.typing || undefined,
    },
    css: state.css,
    tokens,
    darkTokens,
  };

  const skin = slotSkinFromDraft(draft, {
    id: "preview",
    capabilities,
    slotMarkers: state.slotMarkers,
  });
  return { skin, errors };
}

const DEFAULT_CAPABILITIES: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "fallback",
    delay: "native",
  },
  content: { text: true, image: false },
  reactions: false,
  threads: false,
  readReceipts: false,
};
