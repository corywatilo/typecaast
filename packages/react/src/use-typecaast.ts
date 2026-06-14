import { useEffect, useMemo, useState } from "react";
import type { Config, ThemeMode } from "@typecaast/schema";
import type { Player, SimState } from "@typecaast/core";
import { createMockPlayer } from "@typecaast/core/mocks";
import { configToEngine } from "./engine-adapter.js";
import { useResolvedTheme } from "./use-resolved-theme.js";

export interface UseTypecaastOptions {
  /** Force a theme; otherwise resolved from `config.meta.theme`. */
  theme?: ThemeMode;
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
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
  const { theme, autoplay = false, loop = false, rate = 1 } = options;
  const resolved = useResolvedTheme(theme ?? config.meta.theme);

  const player = useMemo<Player>(() => {
    const engine = configToEngine(config, resolved);
    return createMockPlayer(engine.getStateAt, {
      durationMs: engine.durationMs,
      steps: engine.steps,
      loop,
      rate,
    });
  }, [config, resolved, loop, rate]);

  const [state, setState] = useState<SimState>(() => player.state);
  const [currentMs, setCurrentMs] = useState<number>(() => player.currentMs);
  const [playing, setPlaying] = useState<boolean>(() => player.playing);

  useEffect(() => {
    const sync = () => {
      setState(player.state);
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
    if (autoplay) player.play();
    return () => {
      offs.forEach((off) => off());
      player.destroy();
    };
  }, [player, autoplay]);

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
