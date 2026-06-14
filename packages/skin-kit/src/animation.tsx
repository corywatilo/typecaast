import type { CSSProperties, ReactNode } from "react";

/**
 * Animation primitives are **pure functions of progress** (0..1), not CSS
 * transitions or JS timers — so the React preview and the Remotion render
 * animate identically frame-for-frame (PLAN §7). Skins call these driven by
 * `revealProgress` / typing `progress` from `SimState`.
 */

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Decelerating ease, good for reveals. */
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

/** Back-ease-out with overshoot, good for pops. Lands exactly on 1 at t=1. */
export function backEaseOut(t: number, tension = 2.2): number {
  const c3 = tension + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + tension * Math.pow(t - 1, 2);
}

export interface FadeSlideOptions {
  /** Slide distance in px at progress 0 (default 8). */
  distance?: number;
  /** Axis to slide along (default "y"). */
  axis?: "x" | "y";
  easing?: (t: number) => number;
}

/** Fade + slide-in reveal. `progress` 0 → hidden+offset, 1 → shown+settled. */
export function fadeSlideIn(
  progress: number,
  options: FadeSlideOptions = {},
): CSSProperties {
  const eased = (options.easing ?? easeOutCubic)(clamp01(progress));
  const distance = options.distance ?? 8;
  const offset = (1 - eased) * distance;
  const translate =
    options.axis === "x"
      ? `translateX(${offset}px)`
      : `translateY(${offset}px)`;
  return { opacity: eased, transform: translate };
}

export interface PopOptions {
  /** Overshoot tension (default 2.2 ≈ ~10% overshoot). */
  tension?: number;
}

/** Scale pop-in (with a little overshoot), good for reactions landing. */
export function popIn(
  progress: number,
  options: PopOptions = {},
): CSSProperties {
  const p = clamp01(progress);
  const scale = backEaseOut(p, options.tension ?? 2.2);
  return {
    opacity: clamp01(p * 3),
    transform: `scale(${scale})`,
    transformOrigin: "center",
  };
}

export interface TypingDotsProps {
  /** 0..1 progress through the indicator's shown duration. */
  progress?: number;
  count?: number;
  /** Bounce cycles across the full progress (default 4). */
  cycles?: number;
  /** Dot color (default `currentColor`). */
  color?: string;
  /** Dot diameter in px (default 6). */
  size?: number;
  /** Gap between dots in px (default 4). */
  gap?: number;
}

/**
 * The three-dot bouncing typing indicator, animated purely from `progress`
 * (deterministic per frame). Skins style it via props or wrap it.
 */
export function TypingDots({
  progress = 0,
  count = 3,
  cycles = 4,
  color = "currentColor",
  size = 6,
  gap = 4,
}: TypingDotsProps): ReactNode {
  const phase = clamp01(progress) * cycles * Math.PI * 2;
  const dots: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const wave = Math.sin(phase - i * 0.9);
    const lift = Math.max(0, wave) * 4;
    const opacity = 0.4 + Math.max(0, wave) * 0.6;
    dots.push(
      <span
        key={i}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          transform: `translateY(${-lift}px)`,
          opacity,
        }}
      />,
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap }}>
      {dots}
    </span>
  );
}
