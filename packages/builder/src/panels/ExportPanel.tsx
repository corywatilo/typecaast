import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Button, Field, Segmented } from "@typecaast/ui";
import { updateMeta } from "../store.js";
import { embedSnippet, renderSnippet, toJSON } from "../exporting.js";

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
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => {
        copy(text);
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
}: {
  config: ConfigInput;
  onChange: (next: ConfigInput) => void;
}) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const embed = embedSnippet(config);
  const render = renderSnippet(config);

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText) as ConfigInput;
      onChange(parsed);
      setImportError(null);
      setImportText("");
    } catch (e) {
      setImportError((e as Error).message);
    }
  };

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

      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="primary"
          onClick={() => download("typecaast.json", toJSON(config))}
        >
          ⬇ Download JSON
        </Button>
        <CopyButton text={toJSON(config)} label="Copy JSON" />
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
          <CopyButton text={embed} />
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
          <CopyButton text={render} />
        </div>
        <CodeBlock code={render} />
        <p className="tc-muted" style={{ fontSize: 11.5, marginTop: 6 }}>
          No hosted video in v1 — run the OSS CLI. (A “Render for me” service is
          planned.)
        </p>
      </div>

      <div style={{ paddingTop: 8, borderTop: "1px solid var(--tc-border)" }}>
        <span className="tc-label">Import / paste JSON</span>
        <textarea
          className="tc-input"
          style={{
            height: 90,
            padding: 8,
            resize: "vertical",
            marginTop: 6,
            fontFamily: "var(--tc-font-mono)",
            fontSize: 11.5,
          }}
          placeholder="Paste a Typecaast config…"
          value={importText}
          onChange={(e) => setImportText(e.currentTarget.value)}
        />
        {importError ? (
          <p style={{ color: "#e5484d", fontSize: 12, marginTop: 4 }}>
            {importError}
          </p>
        ) : null}
        <div style={{ marginTop: 8 }}>
          <Button
            variant="outline"
            disabled={!importText.trim()}
            onClick={doImport}
          >
            Load config
          </Button>
        </div>
      </div>
    </div>
  );
}
