import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import { clearLocal, loadLocal, saveLocal } from "./persistence.js";

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
});

describe("persistence", () => {
  it("round-trips through localStorage", () => {
    expect(loadLocal()).toBeNull();
    saveLocal(config);
    expect(loadLocal()).toEqual(config);
  });

  it("clears the saved config", () => {
    saveLocal(config);
    clearLocal();
    expect(loadLocal()).toBeNull();
  });
});
