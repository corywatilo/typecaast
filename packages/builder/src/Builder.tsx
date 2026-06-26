import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  configSchema,
  validateConfig,
  type Config,
  type ConfigInput,
  type ThemeMode,
} from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import type { ResolvedTheme } from "@typecaast/core";
import {
  Button,
  Heading,
  IconButton,
  Panel,
  Segmented,
  ThemeRoot,
} from "@typecaast/ui";
import { Preview } from "./Preview.js";
import { TimelinePanel } from "./TimelinePanel.js";
import { Modal } from "./Modal.js";
import { Tooltip } from "./Tooltip.js";
import { IconRedo, IconUndo } from "./icons.js";
import { ParticipantsPanel } from "./panels/ParticipantsPanel.js";
import { SkinPanel } from "./panels/SkinPanel.js";
import { OutputPanel } from "./panels/OutputPanel.js";
import { ExportPanel } from "./panels/ExportPanel.js";
import { ImportPanel } from "./panels/ImportPanel.js";
import {
  addStepAutoPaced,
  blankStep,
  changeStepType,
  deleteStep,
  duplicateStep,
  moveStep,
  updateStep,
} from "./store.js";
import { loadLocal, saveLocal } from "./persistence.js";
import { canRedo, canUndo, historyReducer, initHistory } from "./history.js";

/**
 * User-action events the builder surfaces (PLAN §27 funnel). The builder itself
 * ships **zero telemetry** (it just calls this callback); the host site decides
 * whether to forward them to analytics. Config-derived events (skin selected,
 * step added) come through `onChange` instead.
 */
export type BuilderEvent =
  | "preview_played"
  | "json_exported"
  | "embed_copied"
  | "render_snippet_copied";

export interface BuilderProps {
  /** Initial config (raw or parsed). */
  initialConfig: ConfigInput | Config;
  /** Skins available in the picker, keyed by id. */
  skins: Record<string, Skin>;
  /** The builder chrome theme (the tool itself). */
  theme?: ResolvedTheme;
  /** Called whenever the edited config changes. */
  onChange?: (config: ConfigInput) => void;
  /** Called on discrete user actions (export/share/preview) — see BuilderEvent. */
  onEvent?: (event: BuilderEvent) => void;
  /** Extra controls rendered in the header's top-right (e.g. a theme toggle). */
  headerActions?: ReactNode;
  /** Content rendered immediately right of the wordmark (e.g. site nav links). */
  headerNav?: ReactNode;
  /** Brand mark rendered immediately left of the wordmark (e.g. the site logo). */
  logo?: ReactNode;
  /** Persist to localStorage + the URL hash (shareable links). Default true. */
  persist?: boolean;
  className?: string;
  style?: CSSProperties;
}

type LeftTab = "app" | "timeline" | "participants";

const layout: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
};

const columnHeader: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  // Tabs sit at the left edge to match the section headers in the right
  // column; trailing controls (Import) get pushed to the right by a flex
  // spacer rather than a justifyContent: space-between.
  alignItems: "center",
  padding: "10px 12px",
  borderBottom: "1px solid var(--tc-border)",
};

/**
 * Section divider used in the right column. The right column has no tab bar —
 * Options and Export are stacked sections, separated by a sticky-feeling
 * heading bar (Figma-style). `topBorder` is set on every header except the
 * first so adjacent sections read as separate slabs rather than one big run
 * of content.
 */
function SectionHeader({
  children,
  topBorder = false,
}: {
  children: ReactNode;
  topBorder?: boolean;
}) {
  return (
    <div
      style={{
        padding: "10px 16px",
        borderTop: topBorder ? "1px solid var(--tc-border)" : undefined,
        borderBottom: "1px solid var(--tc-border)",
        background: "var(--tc-bg-subtle)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--tc-muted)",
      }}
    >
      {children}
    </div>
  );
}

export function Builder({
  initialConfig,
  skins,
  theme = "dark",
  onChange,
  onEvent,
  headerActions,
  headerNav,
  logo,
  persist = true,
  className,
  style,
}: BuilderProps) {
  const [history, dispatch] = useReducer(historyReducer, undefined, () =>
    initHistory(
      persist
        ? (loadLocal() ?? (initialConfig as ConfigInput))
        : (initialConfig as ConfigInput),
    ),
  );
  const config = history.config;
  const [selected, setSelected] = useState<number | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeMode>(
    (initialConfig.meta?.theme as ThemeMode) ?? "auto",
  );
  const [leftTab, setLeftTab] = useState<LeftTab>("timeline");
  const [modal, setModal] = useState<null | "import">(null);
  // Which export pipeline the user is targeting. Drives the Export panel tabs
  // and conditionally enables/disables Options fields whose behaviour only
  // applies to one path (FPS only matters for video; Loop only for live code
  // embeds, etc).
  const [exportMode, setExportMode] = useState<"code" | "video">("code");
  // "Custom" app picked in the App tab: there's no built-in skin to preview, so
  // we pause the editor (fade the canvas + options) until a real app is chosen.
  const [customApp, setCustomApp] = useState(false);

  // Commit a config change to history. `coalesce` collapses rapid text edits.
  const commit = useCallback(
    (next: ConfigInput, coalesce = false) =>
      dispatch({ type: "commit", config: next, coalesce, now: Date.now() }),
    [],
  );
  const update = (next: ConfigInput) => commit(next);

  // Persist + notify whenever the config changes (edit, undo, or redo).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (persist) saveLocal(config);
    onChange?.(config);
  }, [config, persist, onChange]);

  // Undo / redo on Cmd/Ctrl+Z (Shift to redo) — but let native undo win while
  // typing in a field, where it edits the text instead of the timeline.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el?.isContentEditable
      )
        return;
      e.preventDefault();
      dispatch({ type: e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = useMemo(() => configSchema.safeParse(config), [config]);
  const diagnostics = useMemo(() => validateConfig(config), [config]);
  const errors = diagnostics.filter((d) => d.severity === "error");
  const skin = skins[config.meta.skin.id];

  const defaultFrom =
    config.participants.find((p) => p.isSelf)?.id ??
    config.participants[0]?.id ??
    "self";

  return (
    <ThemeRoot
      theme={theme}
      className={className}
      style={{ ...layout, ...style }}
    >
      <header
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 16px",
          borderBottom: "1px solid var(--tc-border)",
          background: "var(--tc-panel)",
        }}
      >
        <a
          href="/"
          aria-label="Typecaast home"
          style={{
            color: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {logo}
          <Heading level={2} style={{ fontSize: 15, margin: 0 }}>
            Typecaast
          </Heading>
        </a>
        {headerNav}
        <span style={{ flex: 1 }} />
        <span className="tc-muted" style={{ fontSize: 12 }}>
          {config.timeline.length} steps · {config.participants.length}{" "}
          participants
        </span>
        <Tooltip text="Undo (⌘Z)">
          <IconButton
            aria-label="Undo"
            disabled={!canUndo(history)}
            onClick={() => dispatch({ type: "undo" })}
          >
            <IconUndo size={15} />
          </IconButton>
        </Tooltip>
        <Tooltip text="Redo (⇧⌘Z)">
          <IconButton
            aria-label="Redo"
            disabled={!canRedo(history)}
            onClick={() => dispatch({ type: "redo" })}
          >
            <IconRedo size={15} />
          </IconButton>
        </Tooltip>
        {headerActions}
      </header>

      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
        <aside
          aria-label="Timeline and participants"
          style={{
            flex: "0 0 360px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
            // Pin to the basis: without this, `min-width:auto` lets wide tab
            // content (timeline rows) override it, so the column jumps per tab.
            minWidth: 0,
          }}
        >
          <div style={columnHeader}>
            <Segmented<LeftTab>
              aria-label="Left panel"
              value={leftTab}
              onChange={setLeftTab}
              options={[
                { value: "app", label: "App" },
                { value: "timeline", label: "Timeline" },
                { value: "participants", label: "Participants" },
              ]}
            />
            <span style={{ flex: 1 }} />
            <Tooltip text="Load a typecaast.json file (or paste raw JSON). This replaces the entire current config — undo if you change your mind.">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setModal("import")}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  Import
                  <span
                    aria-hidden
                    style={{
                      fontSize: 12,
                      lineHeight: 1,
                      opacity: 0.55,
                    }}
                  >
                    ⓘ
                  </span>
                </span>
              </Button>
            </Tooltip>
          </div>
          <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
            {leftTab === "app" ? (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  scrollbarGutter: "stable",
                  padding: 16,
                }}
              >
                <SkinPanel
                  config={config}
                  skins={skins}
                  onChange={update}
                  customView={customApp}
                  onCustomView={setCustomApp}
                />
              </div>
            ) : leftTab === "timeline" ? (
              <TimelinePanel
                config={config}
                skin={skin}
                selected={selected}
                onSelect={setSelected}
                onAdd={(t, at) => {
                  const result = addStepAutoPaced(
                    config,
                    blankStep(t, defaultFrom),
                    at,
                  );
                  update(result.config);
                  setSelected(result.index);
                }}
                onDelete={(i) => {
                  update(deleteStep(config, i));
                  setSelected(null);
                }}
                onMove={(from, to) => {
                  update(moveStep(config, from, to));
                  // Keep the expanded editor pointed at the same step.
                  setSelected((s) => {
                    if (s === null) return s;
                    if (s === from) return to;
                    if (from < s && to >= s) return s - 1;
                    if (from > s && to <= s) return s + 1;
                    return s;
                  });
                }}
                onDuplicate={(i) => update(duplicateStep(config, i))}
                onUpdateStep={(i, patch) =>
                  commit(updateStep(config, i, patch as never), true)
                }
                onChangeType={(i, t) => {
                  update(changeStepType(config, i, t, defaultFrom));
                  setSelected(i);
                }}
              />
            ) : (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  scrollbarGutter: "stable",
                  padding: 16,
                }}
              >
                <ParticipantsPanel config={config} onChange={update} />
              </div>
            )}
          </div>
        </aside>

        <main
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            minHeight: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              height: "100%",
              opacity: customApp ? 0.25 : 1,
              filter: customApp ? "grayscale(1)" : undefined,
              pointerEvents: customApp ? "none" : undefined,
              transition: "opacity 150ms ease, filter 150ms ease",
            }}
          >
            {parsed.success && skin ? (
              <Preview
                config={parsed.data as Config}
                skin={skin}
                previewTheme={previewTheme}
                onPreviewThemeChange={setPreviewTheme}
                chromeTheme={theme}
                onPlay={() => onEvent?.("preview_played")}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 24,
                }}
              >
                <Panel raised style={{ maxWidth: 420, padding: 20 }}>
                  <Heading level={2}>Can't preview yet</Heading>
                  {!skin ? (
                    <p className="tc-muted" style={{ fontSize: 13 }}>
                      Unknown skin <code>{config.meta.skin.id}</code>.
                    </p>
                  ) : (
                    <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                      {errors.slice(0, 6).map((d, i) => (
                        <li key={i} className="tc-muted">
                          <span className="tc-mono">{d.location ?? ""}</span>{" "}
                          {d.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            )}
          </div>
          {customApp ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <Panel
                raised
                style={{ maxWidth: 360, padding: 20, textAlign: "center" }}
              >
                <Heading level={2}>Editor paused</Heading>
                <p
                  className="tc-muted"
                  style={{ fontSize: 13, margin: "6px 0 0" }}
                >
                  “Custom” isn’t a previewable app. Pick a built-in app from the{" "}
                  <strong>App</strong> tab to keep editing.
                </p>
              </Panel>
            </div>
          ) : null}
        </main>

        <aside
          aria-label="Options and export"
          style={{
            flex: "0 0 360px",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              // No `scrollbar-gutter: stable` — that reserved a permanent
              // ~14px gap on the right even when nothing was scrolling, so
              // the section backgrounds didn't reach the edge of the panel.
              overflowY: "auto",
              // Paused while "Custom" is selected (no previewable app).
              opacity: customApp ? 0.4 : 1,
              pointerEvents: customApp ? "none" : undefined,
              transition: "opacity 150ms ease",
            }}
          >
            <SectionHeader>Options</SectionHeader>
            <div style={{ padding: "12px 16px 18px" }}>
              <OutputPanel config={config} onChange={update} />
            </div>
            <SectionHeader topBorder>Export</SectionHeader>
            <div style={{ padding: "12px 16px 18px" }}>
              <ExportPanel
                config={config}
                onChange={update}
                onEvent={onEvent}
                exportMode={exportMode}
                onExportModeChange={setExportMode}
              />
            </div>
          </div>
        </aside>
      </div>

      {modal === "import" ? (
        <Modal title="Import config" onClose={() => setModal(null)}>
          <ImportPanel
            onImport={(next) => {
              update(next);
              setSelected(0);
              setModal(null);
            }}
          />
        </Modal>
      ) : null}
    </ThemeRoot>
  );
}
