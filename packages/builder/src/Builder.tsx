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
import { Badge, Heading, Panel, ThemeRoot } from "@typecaast/ui";
import { Preview } from "./Preview.js";
import { TimelinePanel } from "./TimelinePanel.js";
import { Inspector } from "./Inspector.js";
import {
  addStep,
  blankStep,
  deleteStep,
  duplicateStep,
  moveStep,
} from "./store.js";
import { loadFromUrl, loadLocal, saveLocal, updateUrl } from "./persistence.js";

export interface BuilderProps {
  /** Initial config (raw or parsed). */
  initialConfig: ConfigInput | Config;
  /** Skins available in the picker, keyed by id. */
  skins: Record<string, Skin>;
  /** The builder chrome theme (the tool itself). */
  theme?: ResolvedTheme;
  /** Called whenever the edited config changes. */
  onChange?: (config: ConfigInput) => void;
  /** Persist to localStorage + the URL hash (shareable links). Default true. */
  persist?: boolean;
  className?: string;
  style?: CSSProperties;
}

const layout: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  width: "100%",
  overflow: "hidden",
};

export function Builder({
  initialConfig,
  skins,
  theme = "dark",
  onChange,
  persist = true,
  className,
  style,
}: BuilderProps) {
  const [config, setConfig] = useState<ConfigInput>(() =>
    persist
      ? (loadFromUrl() ?? loadLocal() ?? (initialConfig as ConfigInput))
      : (initialConfig as ConfigInput),
  );
  const [selected, setSelected] = useState<number | null>(0);
  const [previewTheme, setPreviewTheme] = useState<ThemeMode>(
    (initialConfig.meta?.theme as ThemeMode) ?? "auto",
  );
  const [loop, setLoop] = useState(false);

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
      </header>

      <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex" }}>
        <aside
          aria-label="Timeline"
          style={{
            flex: "0 0 280px",
            borderRight: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
          }}
        >
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
          />
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
          aria-label="Inspector"
          style={{
            flex: "0 0 320px",
            borderLeft: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
          }}
        >
          <Inspector
            config={config}
            selected={selected}
            skins={skins}
            onChange={update}
          />
        </aside>
      </div>
    </ThemeRoot>
  );
}
