import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import {
  clearLocal,
  loadFromUrl,
  loadLocal,
  saveLocal,
  updateUrl,
} from "./persistence.js";

// Node's experimental localStorage can shadow jsdom's in the test env; install
// a reliable in-memory Storage so we exercise the persistence logic directly.
beforeEach(() => {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
    },
  });
});

const config: ConfigInput = {
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [{ type: "message", from: "a", text: "héllo 🦔" }],
};

afterEach(() => {
  clearLocal();
  window.history.replaceState(null, "", "/");
});

describe("persistence", () => {
  it("round-trips through localStorage", () => {
    expect(loadLocal()).toBeNull();
    saveLocal(config);
    expect(loadLocal()).toEqual(config);
  });

  it("round-trips through the URL hash (unicode-safe)", () => {
    expect(loadFromUrl()).toBeNull();
    updateUrl(config);
    expect(window.location.hash.startsWith("#c=")).toBe(true);
    expect(loadFromUrl()).toEqual(config);
  });

  it("uses replaceState (no history entry added)", () => {
    const before = window.history.length;
    updateUrl(config);
    expect(window.history.length).toBe(before);
  });
});
