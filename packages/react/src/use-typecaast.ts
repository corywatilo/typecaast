import { useEffect, useMemo, useState } from "react";
import type { Config, ThemeMode } from "@typecaast/schema";
import {
  createPlayer,
  type Capabilities,
  type Player,
  type SimState,
} from "@typecaast/core";
import { configToEngine } from "./engine-adapter.js";
import { useResolvedTheme } from "./use-resolved-theme.js";

export interface UseTypecaastOptions {
  /** Force a theme; otherwise resolved from `config.meta.theme`. */
  theme?: ThemeMode;
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
  /** The active skin's capabilities, to drop what it can't render. */
  capabilities?: Capabilities;
}

/** Imperative controls + live state returned by {@link useTypecaast}. */
export interface TypecaastControls {
  state: SimState;
  /** Current playback time in ms (reactive). */
  currentMs: number;
  play(): void;
  pause(): void;
  seek(timeMs: number): void;
  scrubTo(timeMs: number): void;
  setRate(rate: number): void;
  stepNext(): void;
  stepPrev(): void;
  duration: number;
  rate: number;
  playing: boolean;
  /** Escape hatch to the underlying player. */
  player: Player;
}

/**
 * Mount a player for a config and expose live state + controls. The player
 * owns the clock (rAF in the browser); this hook bridges its ticks into React
 * state. The builder uses these controls for preview-as-you-go editing.
 *
 * In M1-UI the player runs over the mocked engine (see engine-adapter); the
 * hook's surface is the final one and does not change when the real engine
 * lands.
 */
export function useTypecaast(
  config: Config,
  options: UseTypecaastOptions = {},
): TypecaastControls {
  const {
    theme,
    autoplay = false,
    // `loop` falls back to `config.meta.loop` so a config authored with looping
    // behaves the same in the builder preview and in zero-prop embeds.
    loop = config.meta.loop ?? false,
    rate = 1,
    capabilities,
  } = options;
  const resolved = useResolvedTheme(theme ?? config.meta.theme);

  // The player is built **theme-agnostic**. Theme has no effect on the timeline —
  // `sampleState` only stamps it onto `state.theme` (it never changes messages,
  // timings, or the composer) — so it's a pure *render* concern. Keeping it out of
  // the player's deps means a light/dark toggle re-paints the current frame instead
  // of destroying the player and restarting the conversation from t=0. The baked
  // "light" is irrelevant; the live theme is overlaid on the sampled state below.
  const player = useMemo<Player>(() => {
    const engine = configToEngine(config, "light", capabilities);
    return createPlayer(engine.getStateAt, {
      durationMs: engine.durationMs,
      steps: engine.steps,
      loop,
      rate,
    });
  }, [config, capabilities, loop, rate]);

  const [rawState, setRawState] = useState<SimState>(() => player.state);
  const [currentMs, setCurrentMs] = useState<number>(() => player.currentMs);
  const [playing, setPlaying] = useState<boolean>(() => player.playing);

  // Overlay the live theme onto the sampled state at the render seam (not in the
  // engine), so flipping the theme yields a new state object against the *same*
  // player — the clock is untouched. Cheap spread; identity-stable when unchanged.
  const state = useMemo<SimState>(
    () =>
      rawState.theme === resolved ? rawState : { ...rawState, theme: resolved },
    [rawState, resolved],
  );

  useEffect(() => {
    const sync = () => {
      setRawState(player.state);
      setCurrentMs(player.currentMs);
    };
    sync();
    setPlaying(player.playing);
    const offs = [
      player.on("tick", sync),
      player.on("seek", sync),
      player.on("play", () => setPlaying(true)),
      player.on("pause", () => setPlaying(false)),
    ];
    return () => {
      offs.forEach((off) => off());
      player.destroy();
    };
  }, [player]);

  // Apply `autoplay` once per player (at creation), not reactively. If this read
  // were a dependency of the subscribe/destroy effect above, a consumer toggling
  // a controlled `paused` — which flips the gated `autoplay` value upstream —
  // would tear down and recreate the live player. Post-mount play/pause is the
  // consumer's job (e.g. `<Typecaast>`'s `paused` reconcile).
  // (deps intentionally exclude `autoplay` — see the comment above.)
  useEffect(() => {
    if (autoplay) player.play();
  }, [player]);

  return {
    state,
    currentMs,
    play: () => player.play(),
    pause: () => player.pause(),
    seek: (t) => player.seek(t),
    scrubTo: (t) => player.scrubTo(t),
    setRate: (r) => player.setRate(r),
    stepNext: () => player.stepNext(),
    stepPrev: () => player.stepPrev(),
    duration: player.durationMs,
    rate: player.rate,
    playing,
    player,
  };
}
