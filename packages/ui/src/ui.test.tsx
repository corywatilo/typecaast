import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Badge, Button, Segmented, ThemeRoot } from "./components.js";

afterEach(cleanup);

describe("design system components", () => {
  it("ThemeRoot scopes the theme", () => {
    render(<ThemeRoot theme="dark">hi</ThemeRoot>);
    const root = document.querySelector(".tc");
    expect(root?.getAttribute("data-tc-theme")).toBe("dark");
  });

  it("Button applies variant + size classes", () => {
    render(
      <Button variant="primary" size="lg">
        Go
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.className).toContain("tc-btn--primary");
    expect(btn.className).toContain("tc-btn--lg");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it("Segmented reflects the value and fires onChange", () => {
    const onChange = vi.fn();
    render(
      <Segmented
        aria-label="Theme"
        value="light"
        onChange={onChange}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
      />,
    );
    const light = screen.getByRole("button", { name: "Light" });
    const dark = screen.getByRole("button", { name: "Dark" });
    expect(light.getAttribute("aria-pressed")).toBe("true");
    expect(dark.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(dark);
    expect(onChange).toHaveBeenCalledWith("dark");
  });

  it("Badge applies a tone", () => {
    render(<Badge tone="accent">beta</Badge>);
    expect(screen.getByText("beta").className).toContain("tc-badge--accent");
  });
});
