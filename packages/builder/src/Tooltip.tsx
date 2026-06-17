import { useRef, useState, type CSSProperties } from "react";

/**
 * An info tooltip whose popover is `position: fixed`, so it escapes a clipping
 * `overflow:auto` ancestor (the scrolling Options/App columns). Positioned from
 * the trigger's rect on hover/focus and clamped to the viewport. Builder-only
 * (the builder is client-rendered), so JS positioning is fine here — unlike the
 * SSR-safe, CSS-only `InfoTip` in `@typecaast/ui`, which gets clipped.
 */
export function InfoTip({ text, label }: { text: string; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(
    null,
  );

  const show = () => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(
      margin,
      Math.min(
        r.left + r.width / 2 - POP_WIDTH / 2,
        window.innerWidth - POP_WIDTH - margin,
      ),
    );
    // Anchor the popover above the trigger.
    setCoords({ left, bottom: window.innerHeight - r.top + 6 });
  };
  const hide = () => setCoords(null);

  return (
    <span
      style={{ display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        ref={ref}
        type="button"
        className="tc-infotip"
        aria-label={label ?? "More info"}
        onFocus={show}
        onBlur={hide}
      >
        i
      </button>
      {coords ? (
        <span role="tooltip" style={{ ...popStyle, ...coords }}>
          {text}
        </span>
      ) : null}
    </span>
  );
}

const POP_WIDTH = 220;

const popStyle: CSSProperties = {
  position: "fixed",
  zIndex: 1000,
  width: POP_WIDTH,
  background: "var(--tc-panel-raised)",
  color: "var(--tc-text)",
  border: "1px solid var(--tc-border-strong)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  lineHeight: 1.45,
  fontWeight: 400,
  textTransform: "none",
  letterSpacing: "normal",
  textAlign: "left",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
  pointerEvents: "none",
};
