import type { SimState } from "./sim-state.js";

/**
 * The load-bearing contract of the whole system (PLAN §3): the engine is a
 * **pure function of time**. Given a timestamp, it returns the complete state
 * of the conversation at that instant — no internal wall-clock timers, no
 * `Date.now()`, no `Math.random()` (jitter is seeded). Because the React clock
 * and the Remotion frame loop both call this, live preview and exported video
 * are identical frame for frame.
 */
export type GetStateAt = (timeMs: number) => SimState;

export type PlayerEvent = "tick" | "end" | "play" | "pause" | "seek";

/** Payload delivered with each player event. */
export interface PlayerEventMap {
  /** Fired each clock tick with the freshly sampled state. */
  tick: SimState;
  /** Fired once when playback reaches the end (non-looping). */
  end: void;
  play: void;
  pause: void;
  /** Fired on seek/scrub, with the new time in ms. */
  seek: number;
}

/**
 * A thin clock wrapper around `GetStateAt`. The React renderer drives this via
 * `requestAnimationFrame`; the builder uses the same surface for
 * preview-as-you-go editing. Remotion bypasses the player and samples
 * `GetStateAt` directly per frame.
 */
export interface Player {
  /** The most recently sampled state. */
  readonly state: SimState;
  /** Total timeline length in ms. */
  readonly durationMs: number;
  /** Current playback time in ms. */
  readonly currentMs: number;
  /** Playback rate multiplier (1 = realtime). */
  readonly rate: number;
  readonly playing: boolean;
  readonly loop: boolean;

  play(): void;
  pause(): void;
  /** Seek to an absolute time in ms (clamped to `[0, durationMs]`). */
  seek(timeMs: number): void;
  /** Alias for `seek`, used by builder scrubbing. */
  scrubTo(timeMs: number): void;
  setRate(rate: number): void;
  setLoop(loop: boolean): void;
  /** Jump to the next step boundary in the compiled timeline. */
  stepNext(): void;
  /** Jump to the previous step boundary. */
  stepPrev(): void;

  /** Subscribe to an event; returns an unsubscribe function. */
  on<E extends PlayerEvent>(
    event: E,
    listener: (payload: PlayerEventMap[E]) => void,
  ): () => void;
  off<E extends PlayerEvent>(
    event: E,
    listener: (payload: PlayerEventMap[E]) => void,
  ): void;

  /** Stop the clock and release resources. */
  destroy(): void;
}
