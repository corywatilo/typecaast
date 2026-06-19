"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { Typecaast } from "@typecaast/react";
import { CodeEditor } from "./CodeEditor";
import { buildSkin, DEFAULT_STATE, type EditorState } from "./buildSkin";
import { editorPreviewConfig } from "./dummyConfig";

const STORAGE_KEY = "typecaast.create-skin.draft.v1";

type TabKey =
  | "frame"
  | "message"
  | "composer"
  | "system"
  | "typing"
  | "css"
  | "tokens"
  | "darkTokens"
  | "capabilities";

const TABS: { key: TabKey; label: string; lang: "html" | "css" | "json" }[] = [
  { key: "frame", label: "Frame HTML", lang: "html" },
  { key: "message", label: "Message HTML", lang: "html" },
  { key: "composer", label: "Composer HTML", lang: "html" },
  { key: "system", label: "System HTML", lang: "html" },
  { key: "typing", label: "Typing HTML", lang: "html" },
  { key: "css", label: "CSS", lang: "css" },
  { key: "tokens", label: "Tokens", lang: "json" },
  { key: "darkTokens", label: "Dark tokens", lang: "json" },
  { key: "capabilities", label: "Capabilities", lang: "json" },
];

function loadInitial(): EditorState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<EditorState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

interface SkinDraftLike {
  meta?: {
    name?: string;
    canvas?: { width?: number; height?: number };
    capturedAt?: unknown;
  };
  slots?: {
    frame?: string;
    message?: string;
    composer?: string;
    system?: string;
    typing?: string;
  };
  css?: string;
  tokens?: { colors?: Record<string, string> };
  darkTokens?: { colors?: Record<string, string> };
  warnings?: string[];
  detection?: {
    frame?: { confidence?: number };
    message?: { confidence?: number; detected?: string[] };
    composer?: { found?: boolean };
  };
}

/** Seed the editor state from a captured `SkinDraft` (drag-and-drop import). */
function fromDraft(draft: SkinDraftLike): EditorState {
  return {
    ...DEFAULT_STATE,
    name: draft.meta?.name ?? "Imported draft",
    frame: draft.slots?.frame ?? "",
    message: draft.slots?.message ?? "",
    composer: draft.slots?.composer ?? "",
    system: draft.slots?.system ?? "",
    typing: draft.slots?.typing ?? "",
    css: draft.css ?? "",
    tokensJson: JSON.stringify(draft.tokens ?? { colors: {} }, null, 2),
    darkTokensJson: draft.darkTokens
      ? JSON.stringify(draft.darkTokens, null, 2)
      : "",
  };
}

export function Editor() {
  const [state, setState] = useState<EditorState>(loadInitial);
  const [activeTab, setActiveTab] = useState<TabKey>("frame");
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Persist on every change (debounced via the event loop).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota — non-fatal */
    }
  }, [state]);

  const built = useMemo(() => buildSkin(state), [state]);

  const update = useCallback(
    <K extends keyof EditorState>(key: K, value: EditorState[K]) =>
      setState((s) => ({ ...s, [key]: value })),
    [],
  );

  const tabValue = (key: TabKey): string => {
    switch (key) {
      case "frame":
        return state.frame;
      case "message":
        return state.message;
      case "composer":
        return state.composer;
      case "system":
        return state.system;
      case "typing":
        return state.typing;
      case "css":
        return state.css;
      case "tokens":
        return state.tokensJson;
      case "darkTokens":
        return state.darkTokensJson;
      case "capabilities":
        return state.capabilitiesJson;
    }
  };

  const setTabValue = (key: TabKey, value: string) => {
    switch (key) {
      case "frame":
        return update("frame", value);
      case "message":
        return update("message", value);
      case "composer":
        return update("composer", value);
      case "system":
        return update("system", value);
      case "typing":
        return update("typing", value);
      case "css":
        return update("css", value);
      case "tokens":
        return update("tokensJson", value);
      case "darkTokens":
        return update("darkTokensJson", value);
      case "capabilities":
        return update("capabilitiesJson", value);
    }
  };

  const tabLang = TABS.find((t) => t.key === activeTab)?.lang ?? "html";

  const onDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text) as SkinDraftLike;
      setState(fromDraft(json));
      setImportNotice(
        `Imported ${file.name} — ${Object.values(json.slots ?? {}).filter(Boolean).length} slot(s), ${(json.css ?? "").length} CSS bytes.`,
      );
    } catch (err) {
      setImportNotice(`Couldn't import: ${(err as Error).message}`);
    }
  };

  const downloadDraft = () => {
    const draft = {
      version: 1,
      meta: { name: state.name },
      slots: {
        ...(state.frame ? { frame: state.frame } : {}),
        ...(state.message ? { message: state.message } : {}),
        ...(state.composer ? { composer: state.composer } : {}),
        ...(state.system ? { system: state.system } : {}),
        ...(state.typing ? { typing: state.typing } : {}),
      },
      css: state.css,
      tokens: tryParse(state.tokensJson, { colors: {} }),
      ...(state.darkTokensJson
        ? { darkTokens: tryParse(state.darkTokensJson, { colors: {} }) }
        : {}),
      detection: {
        frame: { found: !!state.frame, detected: [], confidence: 0 },
        message: { found: !!state.message, detected: [], confidence: 0 },
        composer: { found: !!state.composer, detected: [], confidence: 0 },
        typing: { found: !!state.typing, detected: [], confidence: 0 },
      },
      warnings: [],
    };
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = state.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    a.href = url;
    a.download = `${slug || "skin"}-draft.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefault = () => {
    if (confirm("Discard current draft and start over?")) {
      setState(DEFAULT_STATE);
      setImportNotice(null);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1fr) minmax(420px, 540px) minmax(0, 260px)",
        // Lock the row to the parent's height so each column can scroll its
        // own overflow — without an explicit row track, the grid sizes to
        // content and the CodeMirror host pushes the whole page tall.
        gridTemplateRows: "minmax(0, 1fr)",
        gap: 0,
        height: "100%",
        minHeight: 0,
        background: "var(--tc-bg)",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* Left: editor */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--tc-border)",
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            gap: 2,
            padding: "8px 8px 0",
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "5px 10px",
                fontSize: 12,
                border: "1px solid var(--tc-border)",
                borderBottom: activeTab === t.key ? "none" : undefined,
                borderRadius: "6px 6px 0 0",
                background:
                  activeTab === t.key ? "var(--tc-bg-elev)" : "transparent",
                color: "var(--tc-text)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            background: "var(--tc-bg-elev)",
            borderTop: "1px solid var(--tc-border)",
          }}
        >
          <CodeEditor
            value={tabValue(activeTab)}
            language={tabLang}
            onChange={(v) => setTabValue(activeTab, v)}
          />
        </div>
      </div>

      {/* Center: preview */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "var(--tc-bg-subtle)",
          borderRight: "1px solid var(--tc-border)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 480,
            height: 640,
            background: "var(--tc-bg)",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            overflow: "hidden",
            border: "1px solid var(--tc-border)",
          }}
        >
          <Typecaast
            config={editorPreviewConfig}
            skin={built.skin}
            autoplay
            loop
          />
        </div>
        {dragOver ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(99,102,241,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--tc-text)",
              fontWeight: 600,
              fontSize: 14,
              pointerEvents: "none",
            }}
          >
            Drop a *-skin-draft.json to import
          </div>
        ) : null}
      </div>

      {/* Right: inspector */}
      <aside
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "14px 16px",
          fontSize: 12.5,
          overflow: "auto",
        }}
      >
        <div>
          <label
            className="tc-label"
            style={{ display: "block", marginBottom: 6 }}
          >
            Skin name
          </label>
          <input
            value={state.name}
            onChange={(e) => update("name", e.currentTarget.value)}
            style={{
              width: "100%",
              padding: "5px 8px",
              fontSize: 12.5,
              borderRadius: 6,
              border: "1px solid var(--tc-border)",
              background: "var(--tc-bg)",
              color: "var(--tc-text)",
            }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={state.slotMarkers}
            onChange={(e) => update("slotMarkers", e.currentTarget.checked)}
          />
          Show slot outlines
        </label>

        {built.errors.length > 0 ? (
          <div
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--tc-warn-border, #e9c46a)",
              background: "var(--tc-warn-bg, rgba(250,176,5,0.10))",
              color: "var(--tc-warn, #b45309)",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: 11,
                marginBottom: 4,
              }}
            >
              JSON errors
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {built.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {importNotice ? (
          <div
            className="tc-muted"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              background: "var(--tc-bg-elev)",
              border: "1px solid var(--tc-border)",
            }}
          >
            {importNotice}
          </div>
        ) : null}

        <div className="tc-muted" style={{ fontSize: 11.5, lineHeight: 1.5 }}>
          Drag a <code>*-skin-draft.json</code> from the Chrome extension onto
          this page to seed the editor.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={downloadDraft} style={primaryBtn}>
            Download draft.json
          </button>
          <button onClick={resetToDefault} style={secondaryBtn}>
            Reset to default
          </button>
        </div>

        <details style={{ fontSize: 11.5, lineHeight: 1.55 }}>
          <summary
            className="tc-muted"
            style={{ cursor: "pointer", marginBottom: 6 }}
          >
            Slot reference
          </summary>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>
              <code>data-tc-slot="messages"</code> on the frame mount point
            </li>
            <li>
              <code>{"{{author}}"}</code>, <code>{"{{avatar}}"}</code>,{" "}
              <code>{"{{body}}"}</code>, <code>{"{{time}}"}</code> in the
              message template
            </li>
            <li>
              <code>{"{{composer}}"}</code> in the composer template
            </li>
          </ul>
        </details>
      </aside>
    </div>
  );
}

function tryParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const primaryBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12.5,
  borderRadius: 6,
  border: "1px solid var(--tc-accent)",
  background: "var(--tc-accent)",
  color: "white",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12.5,
  borderRadius: 6,
  border: "1px solid var(--tc-border)",
  background: "transparent",
  color: "var(--tc-text)",
  cursor: "pointer",
};
