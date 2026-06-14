import { useState } from "react";
import type { ConfigInput } from "@typecaast/schema";
import { STEP_TYPES, type StepType } from "@typecaast/schema";
import { Badge, Button, IconButton } from "@typecaast/ui";
import { stepLabel } from "./format.js";
import { StepEditor } from "./StepEditor.js";

export function TimelinePanel({
  config,
  selected,
  onSelect,
  onAdd,
  onDelete,
  onMove,
  onDuplicate,
  onUpdateStep,
  onImport,
}: {
  config: ConfigInput;
  selected: number | null;
  onSelect: (index: number | null) => void;
  onAdd: (type: StepType) => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onUpdateStep: (index: number, patch: Record<string, unknown>) => void;
  onImport: () => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: "1 1 auto", overflowY: "auto", padding: 8 }}>
        {config.timeline.map((step, i) => {
          const active = i === selected;
          return (
            <div key={i} style={{ marginBottom: 4 }}>
              <div
                className="tc-step-row"
                data-active={active ? "" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 9px",
                  borderRadius: active ? "8px 8px 0 0" : 8,
                  border: `1px solid ${active ? "var(--tc-accent)" : "var(--tc-border)"}`,
                  borderBottom: active ? "none" : undefined,
                  background: active
                    ? "var(--tc-bg-subtle)"
                    : "var(--tc-panel)",
                }}
              >
                <button
                  type="button"
                  aria-expanded={active}
                  onClick={() => onSelect(active ? null : i)}
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
                    className="tc-muted"
                    style={{ fontSize: 10, width: 10, opacity: 0.7 }}
                  >
                    {active ? "▾" : "▸"}
                  </span>
                  <span
                    className="tc-muted tc-mono"
                    style={{ fontSize: 11, width: 16 }}
                  >
                    {i + 1}
                  </span>
                  <Badge tone={active ? "accent" : "neutral"}>
                    {step.type}
                  </Badge>
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
              {active ? (
                <div
                  style={{
                    border: "1px solid var(--tc-accent)",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    background: "var(--tc-bg-subtle)",
                    padding: 12,
                  }}
                >
                  <StepEditor
                    step={step}
                    participants={config.participants}
                    onChange={(patch) => onUpdateStep(i, patch)}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
        {config.timeline.length === 0 ? (
          <p className="tc-muted" style={{ padding: 12, fontSize: 13 }}>
            No steps yet — add one to start.
          </p>
        ) : null}
      </div>

      {/* Add new steps from the end of the list — no scrolling back to the top. */}
      {adding ? (
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 10,
            borderTop: "1px solid var(--tc-border)",
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

      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 12px",
          borderTop: "1px solid var(--tc-border)",
        }}
      >
        <Button
          size="sm"
          variant="primary"
          onClick={() => setAdding((v) => !v)}
        >
          + Step
        </Button>
        <Button size="sm" variant="ghost" onClick={onImport}>
          Import
        </Button>
      </div>
    </div>
  );
}
