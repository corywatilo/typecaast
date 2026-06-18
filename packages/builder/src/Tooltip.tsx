import {
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
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

type Placement = "above" | "below";
type PopoverCoords = {
  left: number;
  /** Set when placement is `above`; absent for `below`. */
  bottom?: number;
  /** Set when placement is `below`; absent for `above`. */
  top?: number;
  placement: Placement;
};

/**
 * Compute viewport-clamped coords for a popover anchored to the given trigger
 * rect. We default to `above` and let the caller flip to `below` (after a
 * post-render height measurement) when the popover would clip off the top of
 * the viewport. `left` is centred on the trigger and clamped using
 * `POP_MAX_WIDTH` as a safe upper-bound on the popover's real width — the
 * caller centres horizontally with `translateX(-50%)`.
 */
function popoverCoords(
  rect: DOMRect,
  placement: Placement,
): PopoverCoords | null {
  if (typeof window === "undefined") return null;
  const margin = 8;
  const triggerCenter = rect.left + rect.width / 2;
  const halfMax = POP_MAX_WIDTH / 2;
  const left = Math.max(
    margin + halfMax,
    Math.min(triggerCenter, window.innerWidth - margin - halfMax),
  );
  if (placement === "above") {
    return { left, bottom: window.innerHeight - rect.top + 6, placement };
  }
  return { left, top: rect.bottom + 6, placement };
}

const popTransform: CSSProperties = { transform: "translateX(-50%)" };

/**
 * Shared hover/focus + viewport-flip behaviour for `Tooltip` and `InfoTip`.
 * The popover is rendered above the trigger by default; if its measured top
 * would overflow above the viewport we re-render below the trigger instead.
 */
function usePopoverPlacement(triggerRef: RefObject<HTMLElement | null>) {
  const popRef = useRef<HTMLSpanElement | null>(null);
  const [coords, setCoords] = useState<PopoverCoords | null>(null);

  const show = () => {
    const el = triggerRef.current;
    if (!el) return;
    setCoords(popoverCoords(el.getBoundingClientRect(), "above"));
  };
  const hide = () => setCoords(null);

  // After the first paint of the popover, measure it. If the `above`
  // placement clips off the top of the viewport, flip to `below`. We only do
  // this when transitioning into `above` so the layout effect doesn't
  // ping-pong between placements.
  useLayoutEffect(() => {
    if (!coords || coords.placement !== "above") return;
    const pop = popRef.current;
    const trigger = triggerRef.current;
    if (!pop || !trigger) return;
    if (pop.getBoundingClientRect().top < 8) {
      setCoords(popoverCoords(trigger.getBoundingClientRect(), "below"));
    }
    // We deliberately omit `triggerRef` from deps — it's stable across renders
    // and React's exhaustive-deps lint allows refs.
  }, [coords, triggerRef]);

  return { coords, show, hide, popRef };
}

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
  const { coords, show, hide, popRef } = usePopoverPlacement(wrapperRef);

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
          ref={popRef}
          id={tipId}
          role="tooltip"
          style={{
            ...popStyle,
            ...popTransform,
            left: coords.left,
            top: coords.top,
            bottom: coords.bottom,
          }}
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
  const { coords, show, hide, popRef } = usePopoverPlacement(ref);

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
          ref={popRef}
          role="tooltip"
          style={{
            ...popStyle,
            ...popTransform,
            left: coords.left,
            top: coords.top,
            bottom: coords.bottom,
          }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

/**
 * Visually de-emphasises a child (a field, a control row, …) when it doesn't
 * apply to the current context — e.g. FPS while exporting Code, Loop while
 * exporting Video. The wrapper itself receives hover/focus events so the
 * `reason` tooltip is reachable; inner controls should still get their own
 * `disabled` so they can't be mutated. When `disabled` is false the wrapper
 * is a pass-through.
 */
export function DisabledWrap({
  disabled,
  reason,
  children,
}: {
  disabled: boolean;
  reason: string;
  children: ReactElement;
}) {
  if (!disabled) return children;
  // Two nested spans: the outer carries the dim + `not-allowed` cursor and
  // (via the surrounding Tooltip) hover/focus tracking; the inner sets
  // `pointer-events: none` on the actual control so the parent's cursor is
  // the one the user sees (otherwise a `<button>` or `<select>` reasserts
  // its own cursor: pointer/text on hover).
  return (
    <Tooltip text={reason}>
      <span
        style={{
          display: "block",
          opacity: 0.55,
          cursor: "not-allowed",
        }}
      >
        <span style={{ display: "block", pointerEvents: "none" }}>
          {children}
        </span>
      </span>
    </Tooltip>
  );
}
