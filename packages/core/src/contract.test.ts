import { describe, expect, it } from "vitest";
import { CORE_CONTRACT_VERSION } from "./index.js";
import type { SimState } from "./sim-state.js";

describe("core contract", () => {
  it("exposes a contract version", () => {
    expect(CORE_CONTRACT_VERSION).toBe(1);
  });

  it("a hand-built SimState satisfies the contract type", () => {
    // Compile-time check: this object must conform to SimState.
    const state: SimState = {
      messages: [
        {
          id: "m1",
          from: "cory",
          variant: "message",
          content: [{ type: "text", spans: [{ type: "text", value: "hi" }] }],
          revealProgress: 1,
          state: "sent",
          reactions: [],
          isSelf: true,
          isGrouped: false,
          atMs: 0,
        },
      ],
      typingIndicators: [{ from: "paul", progress: 0.5 }],
      composer: { from: "cory", text: "", caret: 0, sending: false },
      scroll: { targetOffset: 0, reason: "none" },
      durationMs: 5000,
      theme: "light",
    };
    expect(state.messages[0]?.revealProgress).toBe(1);
    expect(state.theme).toBe("light");
  });
});
