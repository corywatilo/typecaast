import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Button, Field, Segmented } from "@typecaast/ui";
import { updateMeta } from "../store.js";
import {
  embedSnippet,
  installSnippet,
  renderSnippet,
  toJSON,
  type PackageManager,
} from "../exporting.js";
import type { BuilderEvent } from "../Builder.js";

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

function CopyButton({
  text,
  label = "Copy",
  onCopied,
}: {
  text: string;
  label?: string;
  onCopied?: () => void;
}) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        copy(text);
        onCopied?.();
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
    >
      {done ? "Copied ✓" : label}
    </Button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      className="tc-mono"
      style={{
        margin: 0,
        padding: 10,
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
  );
}

export function ExportPanel({
  config,
  onChange,
  onEvent,
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
  onEvent?: (event: BuilderEvent) => void;
}) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const [showJson, setShowJson] = useState(false);
  const install = installSnippet(pm);
  const embed = embedSnippet(config);
  const render = renderSnippet(config);
  const json = toJSON(config);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Assets">
        <Segmented
          aria-label="Assets mode"
          value={config.meta.assets ?? "inline"}
          onChange={(v) => onChange(updateMeta(config, { assets: v }))}
          options={[
            { value: "inline", label: "Inline (self-contained)" },
            { value: "url", label: "URL (referenced)" },
          ]}
        />
      </Field>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button
          variant="primary"
          onClick={() => {
            download("typecaast.json", json);
            onEvent?.("json_exported");
          }}
        >
          ⬇ Download JSON
        </Button>
        <CopyButton
          text={json}
          label="Copy JSON"
          onCopied={() => onEvent?.("json_exported")}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowJson((v) => !v)}
        >
          {showJson ? "Hide JSON" : "Preview JSON"}
        </Button>
      </div>
      {showJson ? (
        <div style={{ maxHeight: 260, overflow: "auto" }}>
          <CodeBlock code={json} />
        </div>
      ) : null}

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span className="tc-label">Install</span>
          <CopyButton text={install} />
        </div>
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
        <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          Install the package the snippet below imports, then drop in your
          exported <code>typecaast.json</code>.
        </p>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span className="tc-label">Embed snippet</span>
          <CopyButton text={embed} onCopied={() => onEvent?.("embed_copied")} />
        </div>
        <CodeBlock code={embed} />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span className="tc-label">Render it yourself</span>
          <CopyButton
            text={render}
            onCopied={() => onEvent?.("render_snippet_copied")}
          />
        </div>
        <CodeBlock code={render} />
        <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          No hosted video in v1 — run the OSS CLI. (A “Render for me” service is
          planned.)
        </p>
      </div>
    </div>
  );
}
