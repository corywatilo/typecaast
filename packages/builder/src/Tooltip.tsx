import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * Builder tooltip primitives. Both render their popover with `position: fixed`
 * so it escapes a clipping `overflow:auto` ancestor (the scrolling Options /
 * Timeline columns), unlike the SSR-safe CSS-only `InfoTip` in `@typecaast/ui`.
 *
 * Two shapes:
 *  - `Tooltip` — wrap any focusable trigger (button, link, etc.) and a popover
 *    appears on hover/focus. Use this for icon-only controls (player bar,
 *    toolbar buttons, drag grips). Prefer over `title=` everywhere.
 *  - `InfoTip` — renders a small ⓘ button next to a label as the trigger. Use
 *    this for inline help on form labels (Field#hint).
 *
 * The runtime is client-only because the builder is mounted with `ssr:false`.
 */

const POP_MAX_WIDTH = 240;
const popStyle: CSSProperties = {
  position: "fixed",
  zIndex: 1000,
  // Hug the text — max-width caps long strings; `width: max-content` keeps
  // short labels from stretching to fill that cap.
  width: "max-content",
  maxWidth: POP_MAX_WIDTH,
  background: "var(--tc-panel-raised)",
  color: "var(--tc-text)",
  border: "1px solid var(--tc-border-strong)",
  borderRadius: 8,
  padding: "6px 9px",
  fontSize: 12,
  lineHeight: 1.45,
  fontWeight: 400,
  textTransform: "none",
  letterSpacing: "normal",
  textAlign: "left",
  whiteSpace: "normal",
  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
  pointerEvents: "none",
};

/**
 * Compute viewport-clamped coords that anchor the popover above a trigger's
 * bounding rect. The popover is centred over the trigger via `translateX(-50%)`
 * by the caller; we just clamp `left` so the popover never overflows the
 * viewport (using `POP_MAX_WIDTH` as a safe upper-bound on its real width).
 */
function popoverCoordsAbove(
  rect: DOMRect,
): { left: number; bottom: number } | null {
  if (typeof window === "undefined") return null;
  const margin = 8;
  const triggerCenter = rect.left + rect.width / 2;
  const halfMax = POP_MAX_WIDTH / 2;
  const left = Math.max(
    margin + halfMax,
    Math.min(triggerCenter, window.innerWidth - margin - halfMax),
  );
  return { left, bottom: window.innerHeight - rect.top + 6 };
}

const popTransform: CSSProperties = { transform: "translateX(-50%)" };

/**
 * Wraps any single React element and shows a tooltip popover on hover/focus.
 * The trigger keeps whatever `aria-label` it already has (so screen readers
 * are unaffected); the tooltip is purely a visual augmentation. Pair with an
 * accessible name on the child for a11y.
 */
export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ReactElement;
}) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tipId = useId();
  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

  const show = () => {
    const el = wrapperRef.current;
    if (!el) return;
    setCoords(popoverCoordsAbove(el.getBoundingClientRect()));
  };
  const hide = () => setCoords(null);

  // Wire `aria-describedby` onto the trigger when the popover is open so
  // assistive tech can pick up the supplemental description in addition to
  // the trigger's own accessible name (label/aria-label).
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": coords ? tipId : undefined,
      })
    : children;

  return (
    <span
      ref={wrapperRef}
      style={{ display: "inline-flex" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      {coords ? (
        <span
          id={tipId}
          role="tooltip"
          style={{ ...popStyle, ...popTransform, ...coords }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Inline ⓘ button for explanatory text next to a form label. Click target
 * is keyboard-focusable so the tooltip is reachable without a mouse.
 */
export function InfoTip({
  text,
  label,
}: {
  text: string;
  label?: string;
}): ReactNode {
  const ref = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    bottom: number;
  } | null>(null);

  const show = () => {
    const el = ref.current;
    if (!el) return;
    setCoords(popoverCoordsAbove(el.getBoundingClientRect()));
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
        <span
          role="tooltip"
          style={{ ...popStyle, ...popTransform, ...coords }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
