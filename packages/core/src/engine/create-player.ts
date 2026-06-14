import type {
  GetStateAt,
  Player,
  PlayerEvent,
  PlayerEventMap,
} from "../player.js";
import type { SimState } from "../sim-state.js";

export interface PlayerOptions {
  durationMs: number;
  /** Step boundaries (ms) for stepNext/stepPrev. */
  steps?: number[];
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
}

/** A monotonic time source; reading it doesn't affect `getStateAt` determinism. */
function now(): number {
  const perf = (globalThis as unknown as { performance?: { now(): number } })
    .performance;
  return perf ? perf.now() : Date.now();
}

type FrameHandle = number;

interface SchedulerGlobals {
  requestAnimationFrame?: (cb: (time: number) => void) => number;
  cancelAnimationFrame?: (handle: number) => void;
  setTimeout?: (cb: () => void, ms: number) => number;
  clearTimeout?: (handle: number) => void;
}

function schedule(cb: () => void): FrameHandle {
  const g = globalThis as unknown as SchedulerGlobals;
  if (g.requestAnimationFrame) return g.requestAnimationFrame(() => cb());
  return g.setTimeout ? g.setTimeout(cb, 16) : 0;
}
function unschedule(handle: FrameHandle): void {
  const g = globalThis as unknown as SchedulerGlobals;
  if (g.cancelAnimationFrame) g.cancelAnimationFrame(handle);
  else if (g.clearTimeout) g.clearTimeout(handle);
}

/**
 * The real-time `Player`: a thin clock wrapper around a pure `GetStateAt`
 * (PLAN §5). It owns the only wall-clock in the system (rAF in the browser, a
 * timeout fallback elsewhere) and samples the engine each tick. The same class
 * drove the UI over the mock and now drives it over the real engine — identical
 * surface, so swapping the engine changes nothing here.
 */
export class TimelinePlayer implements Player {
  private readonly getStateAt: GetStateAt;
  private readonly _durationMs: number;
  private readonly steps: number[];
  private _currentMs = 0;
  private _rate: number;
  private _loop: boolean;
  private _playing = false;
  private _state: SimState;
  private anchor = 0;
  private frame: FrameHandle | null = null;
  private listeners = new Map<PlayerEvent, Set<(payload: never) => void>>();

  constructor(getStateAt: GetStateAt, options: PlayerOptions) {
    this.getStateAt = getStateAt;
    this._durationMs = options.durationMs;
    this.steps = (options.steps ?? [0, options.durationMs])
      .slice()
      .sort((a, b) => a - b);
    this._rate = options.rate ?? 1;
    this._loop = options.loop ?? false;
    this._state = getStateAt(0);
    if (options.autoplay) this.play();
  }

  get state(): SimState {
    return this._state;
  }
  get durationMs(): number {
    return this._durationMs;
  }
  get currentMs(): number {
    return this._currentMs;
  }
  get rate(): number {
    return this._rate;
  }
  get playing(): boolean {
    return this._playing;
  }
  get loop(): boolean {
    return this._loop;
  }

  play(): void {
    if (this._playing) return;
    this._playing = true;
    this.anchor = now() - this._currentMs / this._rate;
    this.emit("play", undefined);
    this.tick();
  }

  pause(): void {
    if (!this._playing) return;
    this._playing = false;
    if (this.frame !== null) {
      unschedule(this.frame);
      this.frame = null;
    }
    this.emit("pause", undefined);
  }

  private tick = (): void => {
    if (!this._playing) return;
    const elapsed = (now() - this.anchor) * this._rate;
    if (elapsed >= this._durationMs) {
      if (this._loop) {
        this._currentMs = 0;
        this.anchor = now();
        this.sampleAndEmit();
        this.frame = schedule(this.tick);
        return;
      }
      this._currentMs = this._durationMs;
      this.sampleAndEmit();
      this.pause();
      this.emit("end", undefined);
      return;
    }
    this._currentMs = elapsed;
    this.sampleAndEmit();
    this.frame = schedule(this.tick);
  };

  private sampleAndEmit(): void {
    this._state = this.getStateAt(this._currentMs);
    this.emit("tick", this._state);
  }

  private clamp(t: number): number {
    return t < 0 ? 0 : t > this._durationMs ? this._durationMs : t;
  }

  seek(timeMs: number): void {
    this._currentMs = this.clamp(timeMs);
    this.anchor = now() - this._currentMs / this._rate;
    this.sampleAndEmit();
    this.emit("seek", this._currentMs);
  }

  scrubTo(timeMs: number): void {
    this.seek(timeMs);
  }

  setRate(rate: number): void {
    this._rate = rate <= 0 ? 1 : rate;
    this.anchor = now() - this._currentMs / this._rate;
  }

  setLoop(loop: boolean): void {
    this._loop = loop;
  }

  stepNext(): void {
    const next = this.steps.find((s) => s > this._currentMs + 1e-6);
    this.seek(next ?? this._durationMs);
  }

  stepPrev(): void {
    const prev = [...this.steps]
      .reverse()
      .find((s) => s < this._currentMs - 1e-6);
    this.seek(prev ?? 0);
  }

  on<E extends PlayerEvent>(
    event: E,
    listener: (payload: PlayerEventMap[E]) => void,
  ): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as (payload: never) => void);
    return () => this.off(event, listener);
  }

  off<E extends PlayerEvent>(
    event: E,
    listener: (payload: PlayerEventMap[E]) => void,
  ): void {
    this.listeners.get(event)?.delete(listener as (payload: never) => void);
  }

  private emit<E extends PlayerEvent>(
    event: E,
    payload: PlayerEventMap[E],
  ): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const listener of set)
      (listener as (p: PlayerEventMap[E]) => void)(payload);
  }

  destroy(): void {
    this.pause();
    this.listeners.clear();
  }
}

/** Create a real-time player over a `GetStateAt`. */
export function createPlayer(
  getStateAt: GetStateAt,
  options: PlayerOptions,
): Player {
  return new TimelinePlayer(getStateAt, options);
}
