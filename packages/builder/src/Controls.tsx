import { useState, type CSSProperties, type ReactNode } from "react";
import type { TypecaastControls } from "@typecaast/react";
import { formatMs } from "./format.js";
import { ui } from "./theme.js";

const RATES = [0.5, 1, 1.5, 2];

const bar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  background: ui.panel,
  borderTop: `1px solid ${ui.panelBorder}`,
  color: ui.text,
  fontFamily: ui.font,
  fontSize: 13,
};

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: `1px solid ${ui.panelBorder}`,
        background: ui.chip,
        color: ui.text,
        cursor: "pointer",
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      {children}
    </button>
  );
}

export function Controls({ tc }: { tc: TypecaastControls }) {
  const [rate, setRate] = useState(tc.rate);
  return (
    <div style={bar} data-testid="builder-controls">
      <IconButton label="Previous step" onClick={tc.stepPrev}>
        ⏮
      </IconButton>
      <IconButton
        label={tc.playing ? "Pause" : "Play"}
        onClick={() => (tc.playing ? tc.pause() : tc.play())}
      >
        {tc.playing ? "⏸" : "▶"}
      </IconButton>
      <IconButton label="Next step" onClick={tc.stepNext}>
        ⏭
      </IconButton>
      <input
        type="range"
        min={0}
        max={Math.max(1, Math.round(tc.duration))}
        step={10}
        value={Math.round(tc.currentMs)}
        onChange={(e) => tc.scrubTo(Number(e.currentTarget.value))}
        aria-label="Scrub timeline"
        style={{ flex: 1, accentColor: ui.accent }}
      />
      <span style={{ color: ui.subtle, fontVariantNumeric: "tabular-nums" }}>
        {formatMs(tc.currentMs)} / {formatMs(tc.duration)}
      </span>
      <select
        aria-label="Playback rate"
        value={rate}
        onChange={(e) => {
          const r = Number(e.currentTarget.value);
          setRate(r);
          tc.setRate(r);
        }}
        style={{
          background: ui.chip,
          color: ui.text,
          border: `1px solid ${ui.panelBorder}`,
          borderRadius: 6,
          padding: "5px 6px",
        }}
      >
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>
    </div>
  );
}
