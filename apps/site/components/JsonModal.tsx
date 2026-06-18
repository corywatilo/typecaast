"use client";

import { useEffect, useState } from "react";
import { Button } from "@typecaast/ui";

/**
 * A large, scrollable modal showing the JSON config behind a gallery card, with
 * a copy button. Esc or a backdrop click closes it. Site-local (kept out of the
 * heavy FSL builder bundle so the marketing pages stay light).
 */
export function JsonModal({
  title,
  json,
  onClose,
}: {
  title: string;
  json: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context / denied) — ignore.
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} config`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(900px, 100%)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--tc-bg)",
          color: "var(--tc-text)",
          border: "1px solid var(--tc-border)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: "1px solid var(--tc-border)",
          }}
        >
          <strong style={{ fontSize: 14, flex: 1 }}>
            {title} — typecaast.json
          </strong>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? "Copied ✓" : "Copy"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </Button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 16,
            overflow: "auto",
            fontSize: 12.5,
            lineHeight: 1.5,
            fontFamily: "var(--tc-font-mono, ui-monospace, monospace)",
            background: "var(--tc-bg-subtle)",
            whiteSpace: "pre",
          }}
        >
          {json}
        </pre>
      </div>
    </div>
  );
}
