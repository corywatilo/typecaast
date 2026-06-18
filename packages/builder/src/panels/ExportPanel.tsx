import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Button, Field, IconButton, Segmented, Select } from "@typecaast/ui";
import { updateMeta } from "../store.js";
import {
  embedSnippet,
  installSnippet,
  renderSnippet,
  toJSON,
  type PackageManager,
} from "../exporting.js";
import type { BuilderEvent } from "../Builder.js";
import { DisabledWrap, Tooltip } from "../Tooltip.js";

function copy(text: string): void {
  const nav = (
    globalThis as {
      navigator?: { clipboard?: { writeText(t: string): unknown } };
    }
  ).navigator;
  nav?.clipboard?.writeText(text);
}

function download(name: string, text: string): void {
  const g = globalThis as {
    Blob?: typeof Blob;
    URL?: typeof URL;
    document?: Document;
  };
  if (!g.Blob || !g.URL || !g.document) return;
  const url = g.URL.createObjectURL(
    new g.Blob([text], { type: "application/json" }),
  );
  const a = g.document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  g.URL.revokeObjectURL(url);
}

/**
 * Inline icon-only copy button rendered over the top-right corner of a code
 * block. The transient `✓` flash gives users clear feedback that the click
 * actually copied.
 */
function InlineCopyIcon({
  text,
  onCopied,
}: {
  text: string;
  onCopied?: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <Tooltip text={done ? "Copied" : "Copy to clipboard"}>
      <IconButton
        aria-label="Copy to clipboard"
        onClick={(e) => {
          e.stopPropagation();
          copy(text);
          onCopied?.();
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        }}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          width: 26,
          height: 26,
          // Lift above the code so it stays legible whether or not the block
          // is scrolled.
          background: "var(--tc-panel)",
        }}
      >
        {done ? "✓" : "⧉"}
      </IconButton>
    </Tooltip>
  );
}

/**
 * A code block with the inline `⧉` copy icon pinned to the top-right corner.
 * Used for every snippet we surface (install / embed / render) so the copy
 * affordance stays consistent with the JSON preview below them.
 */
function CodeBlock({
  code,
  onCopied,
}: {
  code: string;
  onCopied?: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <pre
        className="tc-mono"
        style={{
          margin: 0,
          padding: "10px 44px 10px 10px",
          fontSize: 11.5,
          lineHeight: 1.5,
          background: "var(--tc-bg-subtle)",
          border: "1px solid var(--tc-border)",
          borderRadius: 8,
          overflowX: "auto",
          whiteSpace: "pre",
          color: "var(--tc-text-muted)",
        }}
      >
        {code}
      </pre>
      <InlineCopyIcon text={code} onCopied={onCopied} />
    </div>
  );
}

/**
 * Truncated JSON preview window. Collapsed shows the first ~8 lines of the
 * config with a soft fade-to-bg gradient at the bottom; clicking the preview
 * expands it to show the whole document. A copy icon stays pinned to the
 * top-right in both states so it's always reachable without scrolling.
 */
function JsonPreview({
  json,
  onCopied,
}: {
  json: string;
  onCopied?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const collapsedHeight = 168; // ~8 lines at 11.5px/1.5 leading

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--tc-border)",
        borderRadius: 8,
        background: "var(--tc-bg-subtle)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        aria-label={expanded ? "Collapse JSON preview" : "Expand JSON preview"}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "block",
          width: "100%",
          maxHeight: expanded ? 480 : collapsedHeight,
          overflow: expanded ? "auto" : "hidden",
          padding: 0,
          margin: 0,
          border: 0,
          background: "transparent",
          textAlign: "left",
          cursor: expanded ? "auto" : "zoom-in",
          font: "inherit",
          color: "inherit",
        }}
      >
        <pre
          className="tc-mono"
          style={{
            margin: 0,
            padding: "10px 44px 10px 10px",
            fontSize: 11.5,
            lineHeight: 1.5,
            color: "var(--tc-text-muted)",
            whiteSpace: "pre",
          }}
        >
          {json}
        </pre>
      </button>
      {!expanded ? (
        // Soft clip mask that fades the last line into the panel background to
        // signal there's more content. `pointer-events: none` so the overlay
        // doesn't swallow clicks on the (zoom-in) button beneath it.
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 56,
            pointerEvents: "none",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, var(--tc-bg-subtle) 92%)",
          }}
        />
      ) : null}
      <InlineCopyIcon text={json} onCopied={onCopied} />
    </div>
  );
}

/**
 * A small badge for "Step 1", "Step 2", … rendered alongside a section
 * heading so the embed flow reads as an ordered checklist.
 */
function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: 999,
          background: "var(--tc-accent)",
          color: "white",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {n}
      </span>
      <span className="tc-label">{title}</span>
    </div>
  );
}

export type ExportMode = "code" | "video";

export function ExportPanel({
  config,
  onChange,
  onEvent,
  exportMode,
  onExportModeChange,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
  onEvent?: (event: BuilderEvent) => void;
  /** Which export pipeline the user is targeting. Lifted to `Builder` so the
   *  Options panel can disable fields that only apply to the other mode. */
  exportMode: ExportMode;
  onExportModeChange: (mode: ExportMode) => void;
}) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const install = installSnippet(pm);
  const embed = embedSnippet(config);
  const render = renderSnippet(config);
  const json = toJSON(config);

  // Assets mode controls how the *JSON* references binary blobs — only
  // meaningful for the code path. The video render bakes everything in
  // regardless, so we disable the picker (with an explanatory tooltip) when
  // Video is the active export.
  const assetsDisabled = exportMode === "video";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Segmented<ExportMode>
        aria-label="Export type"
        value={exportMode}
        onChange={onExportModeChange}
        options={[
          { value: "code", label: "Code" },
          { value: "video", label: "Video" },
        ]}
      />

      {/* `Assets` switched from a Segmented control to a plain Select so it
          doesn't read as a peer of the Code/Video tabs above. */}
      <DisabledWrap
        disabled={assetsDisabled}
        reason="Video renders bake all assets in — Assets mode only applies to the Code export."
      >
        <Field label="Assets">
          <Select
            disabled={assetsDisabled}
            value={config.meta.assets ?? "inline"}
            onChange={(e) =>
              onChange(
                updateMeta(config, {
                  assets: e.currentTarget.value as "inline" | "url",
                }),
              )
            }
          >
            <option value="inline">Inline (self-contained)</option>
            <option value="url">URL (referenced)</option>
          </Select>
        </Field>
      </DisabledWrap>

      {exportMode === "code" ? (
        <>
          <div>
            <StepHeader n={1} title="Install" />
            <div style={{ marginBottom: 6 }}>
              <Segmented<PackageManager>
                aria-label="Package manager"
                value={pm}
                onChange={setPm}
                options={[
                  { value: "npm", label: "npm" },
                  { value: "yarn", label: "yarn" },
                  { value: "pnpm", label: "pnpm" },
                ]}
              />
            </div>
            <CodeBlock code={install} />
          </div>

          <div>
            <StepHeader n={2} title="Embed snippet" />
            <CodeBlock
              code={embed}
              onCopied={() => onEvent?.("embed_copied")}
            />
            <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
              Drop this into a React component. The skin is lazy-loaded from
              <code> config.meta.skin</code>.
            </p>
          </div>

          <div>
            <StepHeader n={3} title="Content" />
            <JsonPreview
              json={json}
              onCopied={() => onEvent?.("json_exported")}
            />
            <div style={{ marginTop: 8 }}>
              <Button
                variant="primary"
                onClick={() => {
                  download("typecaast.json", json);
                  onEvent?.("json_exported");
                }}
              >
                ⬇ Download typecaast.json
              </Button>
            </div>
            <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
              Click the preview to expand. The embed snippet imports this file.
            </p>
          </div>
        </>
      ) : (
        <div>
          <p className="tc-label" style={{ marginBottom: 8 }}>
            Render with the CLI
          </p>
          <CodeBlock
            code={render}
            onCopied={() => onEvent?.("render_snippet_copied")}
          />
          <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 8 }}>
            No hosted video in v1 — run the OSS CLI to produce an MP4. (A
            “Render for me” service is planned.)
          </p>
        </div>
      )}
    </div>
  );
}
