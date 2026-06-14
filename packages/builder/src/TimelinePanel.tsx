import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { STEP_TYPES, type StepType } from "@typecaast/schema";
import { Badge, Button, IconButton } from "@typecaast/ui";
import { stepLabel } from "./format.js";

export function TimelinePanel({
  config,
  selected,
  onSelect,
  onAdd,
  onDelete,
  onMove,
  onDuplicate,
}: {
  config: ConfigInput;
  selected: number | null;
  onSelect: (index: number) => void;
  onAdd: (type: StepType) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderBottom: "1px solid var(--tc-border)",
        }}
      >
        <span className="tc-h2">Timeline</span>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setAdding((v) => !v)}
        >
          + Step
        </Button>
      </div>

      {adding ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 10,
            borderBottom: "1px solid var(--tc-border)",
            background: "var(--tc-bg-subtle)",
          }}
        >
          {STEP_TYPES.map((t) => (
            <Button
              key={t}
              size="sm"
              variant="ghost"
              onClick={() => {
                onAdd(t);
                setAdding(false);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      ) : null}

      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 8 }}>
        {config.timeline.map((step, i) => {
          const active = i === selected;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 9px",
                marginBottom: 4,
                borderRadius: 8,
                border: `1px solid ${active ? "var(--tc-accent)" : "var(--tc-border)"}`,
                background: active ? "var(--tc-bg-subtle)" : "var(--tc-panel)",
              }}
            >
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                  padding: 0,
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "inherit",
                  font: "inherit",
                  textAlign: "left",
                }}
              >
                <span
                  className="tc-muted tc-mono"
                  style={{ fontSize: 11, width: 16 }}
                >
                  {i + 1}
                </span>
                <Badge tone={active ? "accent" : "neutral"}>{step.type}</Badge>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stepLabel(step)}
                </span>
              </button>
              <span style={{ display: "flex", gap: 2 }}>
                <IconButton
                  aria-label="Move up"
                  onClick={() => onMove(i, i - 1)}
                  style={{ width: 24, height: 24 }}
                >
                  ↑
                </IconButton>
                <IconButton
                  aria-label="Move down"
                  onClick={() => onMove(i, i + 1)}
                  style={{ width: 24, height: 24 }}
                >
                  ↓
                </IconButton>
                <IconButton
                  aria-label="Duplicate"
                  onClick={() => onDuplicate(i)}
                  style={{ width: 24, height: 24 }}
                >
                  ⧉
                </IconButton>
                <IconButton
                  aria-label="Delete step"
                  onClick={() => onDelete(i)}
                  style={{ width: 24, height: 24 }}
                >
                  ✕
                </IconButton>
              </span>
            </div>
          );
        })}
        {config.timeline.length === 0 ? (
          <p className="tc-muted" style={{ padding: 12, fontSize: 13 }}>
            No steps yet — add one to start.
          </p>
        ) : null}
      </div>
    </div>
  );
}
