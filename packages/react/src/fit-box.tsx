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
 * - `reflow`: fills width; content re-wraps (container query / ResizeObserver).
 * - `scale`: renders at exact canvas size, CSS-scaled to fit (layout preserved).
 * - `fixed`: exact canvas size, clipped.
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
        style={{ width: "100%", ...style }}
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
