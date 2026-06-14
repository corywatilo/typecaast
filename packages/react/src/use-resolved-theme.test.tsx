import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResolvedTheme } from "./use-resolved-theme.js";

interface FakeMql {
  matches: boolean;
  fire: (matches: boolean) => void;
}

function mockMatchMedia(initial: boolean): FakeMql {
  const listeners = new Set<() => void>();
  const mql = {
    matches: initial,
    media: "(prefers-color-scheme: dark)",
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    get matches() {
      return mql.matches;
    },
    fire(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((l) => l());
    },
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("useResolvedTheme", () => {
  it("forces light/dark regardless of OS preference", () => {
    mockMatchMedia(true);
    expect(renderHook(() => useResolvedTheme("light")).result.current).toBe(
      "light",
    );
    expect(renderHook(() => useResolvedTheme("dark")).result.current).toBe(
      "dark",
    );
  });

  it("falls back to light for auto with no matchMedia", () => {
    expect(renderHook(() => useResolvedTheme("auto")).result.current).toBe(
      "light",
    );
  });

  it("tracks OS preference for auto, reactively", () => {
    const mql = mockMatchMedia(true);
    const { result } = renderHook(() => useResolvedTheme("auto"));
    expect(result.current).toBe("dark");
    act(() => mql.fire(false));
    expect(result.current).toBe("light");
  });
});
