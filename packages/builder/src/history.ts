import type { ConfigInput } from "@typecaast/schema";

/**
 * Undo/redo history for the edited config. `commit` pushes the previous config
 * onto `past` and clears `future`; rapid **coalescable** edits (text typing)
 * within `COALESCE_MS` replace nothing — they collapse into one undo step so
 * Cmd+Z feels natural instead of undoing character by character. Structural
 * actions (add/delete/move/duplicate/skin/import) always push.
 */
export interface HistoryState {
  config: ConfigInput;
  past: ConfigInput[];
  future: ConfigInput[];
  lastCommit: number;
}

export type HistoryAction =
  | { type: "commit"; config: ConfigInput; coalesce: boolean; now: number }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; config: ConfigInput };

export const COALESCE_MS = 500;
const MAX_HISTORY = 100;

export function initHistory(config: ConfigInput): HistoryState {
  return { config, past: [], future: [], lastCommit: 0 };
}

export function historyReducer(
  s: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "commit": {
      const coalescing =
        action.coalesce && action.now - s.lastCommit < COALESCE_MS;
      return {
        config: action.config,
        past: coalescing ? s.past : [...s.past, s.config].slice(-MAX_HISTORY),
        future: [],
        lastCommit: action.now,
      };
    }
    case "undo": {
      if (s.past.length === 0) return s;
      const prev = s.past[s.past.length - 1]!;
      return {
        config: prev,
        past: s.past.slice(0, -1),
        future: [s.config, ...s.future],
        lastCommit: 0,
      };
    }
    case "redo": {
      if (s.future.length === 0) return s;
      const next = s.future[0]!;
      return {
        config: next,
        past: [...s.past, s.config],
        future: s.future.slice(1),
        lastCommit: 0,
      };
    }
    case "reset":
      return initHistory(action.config);
  }
}

export const canUndo = (s: HistoryState): boolean => s.past.length > 0;
export const canRedo = (s: HistoryState): boolean => s.future.length > 0;
