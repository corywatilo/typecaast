import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import type { FitMode, Size } from "@typecaast/schema";

export interface FitBoxProps {
  fit: FitMode;
  canvas: Size;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Applies the `fit` strategy between the authoring canvas and the host
 * container (PLAN §7):
 * - `reflow`: **fills both axes** (width + height); content re-wraps to the
 *   container width and the bottom-anchored thread clips older messages
 *   when they overflow vertically. The widget is container-driven — it
 *   never grows past its host as more steps play.
 * - `scale`: renders at exact canvas size, CSS-scaled to fit (layout
 *   preserved). Use when you want the skin to look like its native canvas
 *   regardless of container size.
 * - `fixed`: exact canvas size, clipped — the only mode where the widget
 *   is *not* container-driven.
 */
export function FitBox({
  fit,
  canvas,
  children,
  className,
  style,
}: FitBoxProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<{ w: number; h: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setContainer({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (fit === "reflow") {
    return (
      <div
        ref={ref}
        className={className}
        data-fit="reflow"
        // `height: 100%` closes the height chain: combined with the parent
        // `<Typecaast>` outer's `aspect-ratio` fallback, the widget fills
        // its host container instead of growing taller as more messages
        // play (the skin's bottom-anchored thread + `overflow: hidden`
        // clip older steps off the top).
        style={{ width: "100%", height: "100%", ...style }}
      >
        {children}
      </div>
    );
  }

  if (fit === "fixed") {
    return (
      <div
        ref={ref}
        className={className}
        data-fit="fixed"
        style={{
          width: canvas.width,
          height: canvas.height,
          overflow: "hidden",
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // scale: fit the exact-size canvas into the measured container.
  const scale = container
    ? Math.min(container.w / canvas.width, container.h / canvas.height)
    : 1;
  return (
    <div
      ref={ref}
      className={className}
      data-fit="scale"
      style={{ width: "100%", height: "100%", overflow: "hidden", ...style }}
    >
      <div
        data-fit-canvas=""
        style={{
          width: canvas.width,
          height: canvas.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
