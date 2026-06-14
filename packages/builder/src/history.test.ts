import { describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import {
  canRedo,
  canUndo,
  historyReducer,
  initHistory,
  COALESCE_MS,
} from "./history.js";

const cfg = (n: number): ConfigInput => ({
  version: 1,
  meta: { canvas: { width: 1, height: 1 }, skin: { id: "x" } },
  participants: [],
  timeline: Array.from({ length: n }, () => ({ type: "send" })),
});

const commit = (config: ConfigInput, now: number, coalesce = false) =>
  ({ type: "commit", config, coalesce, now }) as const;

describe("historyReducer", () => {
  it("undo/redo walk the structural history", () => {
    let s = initHistory(cfg(0));
    expect(canUndo(s)).toBe(false);
    s = historyReducer(s, commit(cfg(1), 1000));
    s = historyReducer(s, commit(cfg(2), 2000));
    expect(s.config.timeline.length).toBe(2);
    expect(canUndo(s)).toBe(true);

    s = historyReducer(s, { type: "undo" });
    expect(s.config.timeline.length).toBe(1);
    s = historyReducer(s, { type: "undo" });
    expect(s.config.timeline.length).toBe(0);
    expect(canUndo(s)).toBe(false);
    expect(canRedo(s)).toBe(true);

    s = historyReducer(s, { type: "redo" });
    expect(s.config.timeline.length).toBe(1);
  });

  it("coalesces rapid edits into one undo step, splits slow ones", () => {
    let s = initHistory(cfg(0));
    s = historyReducer(s, commit(cfg(1), 1000, true)); // first edit pushes
    s = historyReducer(s, commit(cfg(2), 1000 + 100, true)); // within window
    s = historyReducer(s, commit(cfg(3), 1000 + 200, true)); // within window
    // One undo jumps back past the whole burst.
    expect(s.config.timeline.length).toBe(3);
    const u = historyReducer(s, { type: "undo" });
    expect(u.config.timeline.length).toBe(0);

    // A slow follow-up edit is its own step.
    s = historyReducer(s, commit(cfg(4), 1000 + 200 + COALESCE_MS + 1, true));
    const u2 = historyReducer(s, { type: "undo" });
    expect(u2.config.timeline.length).toBe(3);
  });

  it("a new commit clears the redo stack", () => {
    let s = initHistory(cfg(0));
    s = historyReducer(s, commit(cfg(1), 1000));
    s = historyReducer(s, { type: "undo" });
    expect(canRedo(s)).toBe(true);
    s = historyReducer(s, commit(cfg(5), 2000));
    expect(canRedo(s)).toBe(false);
  });
});
