import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  backEaseOut,
  clamp01,
  easeOutCubic,
  fadeSlideIn,
  popIn,
  TypingDots,
} from "./animation.js";

describe("easing helpers", () => {
  it("clamp01 bounds to [0,1]", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.5)).toBe(0.5);
  });

  it("easeOutCubic hits 0 and 1 at the endpoints", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
  });

  it("backEaseOut lands exactly on 1 at t=1 and overshoots in the middle", () => {
    expect(backEaseOut(1)).toBeCloseTo(1, 10);
    expect(backEaseOut(0.7)).toBeGreaterThan(1);
  });
});

describe("fadeSlideIn", () => {
  it("is hidden and offset at progress 0", () => {
    expect(fadeSlideIn(0)).toEqual({
      opacity: 0,
      transform: "translateY(8px)",
    });
  });

  it("is shown and settled at progress 1", () => {
    expect(fadeSlideIn(1)).toEqual({
      opacity: 1,
      transform: "translateY(0px)",
    });
  });

  it("honors axis + distance options", () => {
    expect(fadeSlideIn(0, { axis: "x", distance: 20 }).transform).toBe(
      "translateX(20px)",
    );
  });
});

describe("popIn", () => {
  it("settles to scale(1) at progress 1", () => {
    expect(popIn(1).transform).toBe("scale(1)");
  });
});

describe("TypingDots", () => {
  it("renders the requested number of dots", () => {
    const html = renderToStaticMarkup(<TypingDots progress={0.25} count={3} />);
    const dots = html.match(/border-radius:50%/g) ?? [];
    expect(dots).toHaveLength(3);
  });

  it("is deterministic for a given progress", () => {
    const a = renderToStaticMarkup(<TypingDots progress={0.4} />);
    const b = renderToStaticMarkup(<TypingDots progress={0.4} />);
    expect(a).toBe(b);
  });
});
