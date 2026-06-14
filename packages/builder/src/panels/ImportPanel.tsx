import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { Button } from "@typecaast/ui";

/** Paste-or-load a Typecaast config JSON. Lives in the Import modal. */
export function ImportPanel({
  onImport,
}: {
  onImport: (config: ConfigInput) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const doImport = () => {
    try {
      const parsed = JSON.parse(text) as ConfigInput;
      onImport(parsed);
      setError(null);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p className="tc-muted" style={{ fontSize: 13, margin: 0 }}>
        Paste a Typecaast config JSON to load it into the builder.
      </p>
      <textarea
        className="tc-input"
        style={{
          height: 200,
          padding: 8,
          resize: "vertical",
          fontFamily: "var(--tc-font-mono)",
          fontSize: 12,
        }}
        placeholder="Paste a Typecaast config…"
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
      />
      {error ? (
        <p style={{ color: "#e5484d", fontSize: 12, margin: 0 }}>{error}</p>
      ) : null}
      <div>
        <Button variant="primary" disabled={!text.trim()} onClick={doImport}>
          Load config
        </Button>
      </div>
    </div>
  );
}
