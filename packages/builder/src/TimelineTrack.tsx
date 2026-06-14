import type { CSSProperties } from "react";
import type { TimelineStep } from "@typecaast/schema";
import { stepLabel } from "./format.js";
import { ui } from "./theme.js";

const track: CSSProperties = {
  display: "flex",
  gap: 6,
  padding: 10,
  overflowX: "auto",
  background: ui.panel,
  borderTop: `1px solid ${ui.panelBorder}`,
  fontFamily: ui.font,
};

function chip(active: boolean): CSSProperties {
  return {
    flex: "0 0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 3,
    minWidth: 96,
    maxWidth: 160,
    padding: "6px 9px",
    borderRadius: 8,
    border: `1px solid ${active ? ui.accent : ui.panelBorder}`,
    background: active ? ui.chipActive : ui.chip,
    color: ui.text,
    cursor: "pointer",
    textAlign: "left",
  };
}

export interface TimelineTrackProps {
  steps: TimelineStep[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export function TimelineTrack({
  steps,
  activeIndex,
  onSelect,
}: TimelineTrackProps) {
  return (
    <div style={track} data-testid="builder-track">
      {steps.map((step, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          style={chip(i === activeIndex)}
          aria-current={i === activeIndex}
        >
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              color: ui.subtle,
            }}
          >
            {step.type}
          </span>
          <span
            style={{
              fontSize: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 142,
            }}
          >
            {stepLabel(step)}
          </span>
        </button>
      ))}
    </div>
  );
}
