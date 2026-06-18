import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FitBox } from "./fit-box.js";

afterEach(cleanup);

const canvas = { width: 880, height: 720 };

describe("FitBox", () => {
  it("reflow fills both axes and tags the mode", () => {
    render(
      <FitBox fit="reflow" canvas={canvas}>
        <span>x</span>
      </FitBox>,
    );
    const el = document.querySelector('[data-fit="reflow"]') as HTMLElement;
    expect(el).toBeTruthy();
    // Reflow is container-driven on both axes — the bottom-anchored skin
    // thread relies on a definite parent height to clip overflow.
    expect(el.style.width).toBe("100%");
    expect(el.style.height).toBe("100%");
  });

  it("fixed pins the canvas size and clips", () => {
    render(
      <FitBox fit="fixed" canvas={canvas}>
        <span>x</span>
      </FitBox>,
    );
    const el = document.querySelector('[data-fit="fixed"]') as HTMLElement;
    expect(el.style.width).toBe("880px");
    expect(el.style.height).toBe("720px");
    expect(el.style.overflow).toBe("hidden");
  });

  it("scale wraps an exact-size canvas with a transform", () => {
    render(
      <FitBox fit="scale" canvas={canvas}>
        <span>x</span>
      </FitBox>,
    );
    expect(document.querySelector('[data-fit="scale"]')).toBeTruthy();
    const inner = document.querySelector("[data-fit-canvas]") as HTMLElement;
    expect(inner.style.width).toBe("880px");
    // No ResizeObserver in jsdom → scale falls back to 1.
    expect(inner.style.transform).toBe("scale(1)");
  });

  it("renders its children", () => {
    render(
      <FitBox fit="reflow" canvas={canvas}>
        <span data-testid="child">hi</span>
      </FitBox>,
    );
    expect(screen.getByTestId("child").textContent).toBe("hi");
  });
});
