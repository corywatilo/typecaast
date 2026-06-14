import { useMemo, useState, type CSSProperties } from "react";
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
  Badge,
  Button,
  Heading,
  Panel,
  Segmented,
  ThemeRoot,
} from "@typecaast/ui";
import { Preview } from "./Preview.js";
import { TimelinePanel } from "./TimelinePanel.js";
import { Modal } from "./Modal.js";
import { CastPanel } from "./panels/CastPanel.js";
import { SkinPanel } from "./panels/SkinPanel.js";
import { OutputPanel } from "./panels/OutputPanel.js";
import { ExportPanel } from "./panels/ExportPanel.js";
import { ImportPanel } from "./panels/ImportPanel.js";
import {
  addStep,
  blankStep,
  deleteStep,
  duplicateStep,
  moveStep,
  updateStep,
} from "./store.js";
import { loadFromUrl, loadLocal, saveLocal, updateUrl } from "./persistence.js";

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
  | "share_link_created"
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
  /** Persist to localStorage + the URL hash (shareable links). Default true. */
  persist?: boolean;
  className?: string;
  style?: CSSProperties;
}

type LeftTab = "timeline" | "cast";
type RightTab = "app" | "options";

const layout: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
};

const columnHeader: CSSProperties = {
  flex: "0 0 auto",
  padding: "10px 12px",
  borderBottom: "1px solid var(--tc-border)",
};

export function Builder({
  initialConfig,
  skins,
  theme = "dark",
  onChange,
  onEvent,
  persist = true,
  className,
  style,
}: BuilderProps) {
  const [config, setConfig] = useState<ConfigInput>(() =>
    persist
      ? (loadFromUrl() ?? loadLocal() ?? (initialConfig as ConfigInput))
      : (initialConfig as ConfigInput),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [previewTheme, setPreviewTheme] = useState<ThemeMode>(
    (initialConfig.meta?.theme as ThemeMode) ?? "auto",
  );
  const [loop, setLoop] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>("timeline");
  const [rightTab, setRightTab] = useState<RightTab>("app");
  const [modal, setModal] = useState<null | "export" | "import">(null);

  const update = (next: ConfigInput) => {
    setConfig(next);
    if (persist) {
      saveLocal(next);
      updateUrl(next);
    }
    onChange?.(next);
  };

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
        <Heading level={2} style={{ fontSize: 15 }}>
          Typecaast
        </Heading>
        <Badge tone="accent">Builder</Badge>
        <span style={{ flex: 1 }} />
        <span className="tc-muted" style={{ fontSize: 12 }}>
          {config.timeline.length} steps · {config.participants.length} cast
        </span>
        <Button size="sm" variant="primary" onClick={() => setModal("export")}>
          Export
        </Button>
      </header>

      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
        <aside
          aria-label="Timeline and cast"
          style={{
            flex: "0 0 300px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
          }}
        >
          <div style={columnHeader}>
            <Segmented<LeftTab>
              aria-label="Left panel"
              value={leftTab}
              onChange={setLeftTab}
              options={[
                { value: "timeline", label: "Timeline" },
                { value: "cast", label: "Cast" },
              ]}
            />
          </div>
          <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
            {leftTab === "timeline" ? (
              <TimelinePanel
                config={config}
                selected={selected}
                onSelect={setSelected}
                onAdd={(t) => {
                  update(addStep(config, blankStep(t, defaultFrom)));
                  setSelected(config.timeline.length);
                }}
                onDelete={(i) => {
                  update(deleteStep(config, i));
                  setSelected(null);
                }}
                onMove={(from, to) => update(moveStep(config, from, to))}
                onDuplicate={(i) => update(duplicateStep(config, i))}
                onUpdateStep={(i, patch) =>
                  update(updateStep(config, i, patch as never))
                }
                onImport={() => setModal("import")}
              />
            ) : (
              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                <CastPanel config={config} onChange={update} />
              </div>
            )}
          </div>
        </aside>

        <main style={{ flex: "1 1 auto", minWidth: 0, minHeight: 0 }}>
          {parsed.success && skin ? (
            <Preview
              config={parsed.data as Config}
              skin={skin}
              previewTheme={previewTheme}
              onPreviewThemeChange={setPreviewTheme}
              loop={loop}
              onLoopChange={setLoop}
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
        </main>

        <aside
          aria-label="App and options"
          style={{
            flex: "0 0 320px",
            display: "flex",
            flexDirection: "column",
            borderLeft: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
          }}
        >
          <div style={columnHeader}>
            <Segmented<RightTab>
              aria-label="Right panel"
              value={rightTab}
              onChange={setRightTab}
              options={[
                { value: "app", label: "App" },
                { value: "options", label: "Options" },
              ]}
            />
          </div>
          <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 16 }}>
            {rightTab === "app" ? (
              <SkinPanel config={config} skins={skins} onChange={update} />
            ) : (
              <OutputPanel config={config} onChange={update} />
            )}
          </div>
        </aside>
      </div>

      {modal === "export" ? (
        <Modal title="Export" onClose={() => setModal(null)} width={560}>
          <ExportPanel config={config} onChange={update} onEvent={onEvent} />
        </Modal>
      ) : null}
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
