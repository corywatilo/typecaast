import { useEffect, type ReactNode } from "react";
import { IconButton } from "@typecaast/ui";

/** A lightweight centered modal with a backdrop. Esc / backdrop click closes. */
export function Modal({
  title,
  onClose,
  children,
  width = 520,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "85vh",
          overflowY: "auto",
          background: "var(--tc-panel)",
          border: "1px solid var(--tc-border)",
          borderRadius: 12,
          boxShadow: "var(--tc-shadow)",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            borderBottom: "1px solid var(--tc-border)",
            background: "var(--tc-panel)",
          }}
        >
          <span className="tc-h2" style={{ fontSize: 15 }}>
            {title}
          </span>
          <span style={{ flex: 1 }} />
          <IconButton aria-label="Close" onClick={onClose}>
            ✕
          </IconButton>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}
