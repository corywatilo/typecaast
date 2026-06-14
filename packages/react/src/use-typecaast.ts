import { useEffect, useMemo, useState } from "react";
import type { Config, ThemeMode } from "@typecaast/schema";
import type { Player, SimState } from "@typecaast/core";
import { createMockPlayer } from "@typecaast/core/mocks";
import { configToEngine } from "./engine-adapter.js";
import { resolveTheme } from "./resolve-theme.js";

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
  const resolved = resolveTheme(theme ?? config.meta.theme);

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

  useEffect(() => {
    setState(player.state);
    const off = player.on("tick", setState);
    if (autoplay) player.play();
    return () => {
      off();
      player.destroy();
    };
  }, [player, autoplay]);

  return {
    state,
    play: () => player.play(),
    pause: () => player.pause(),
    seek: (t) => player.seek(t),
    scrubTo: (t) => player.scrubTo(t),
    setRate: (r) => player.setRate(r),
    stepNext: () => player.stepNext(),
    stepPrev: () => player.stepPrev(),
    duration: player.durationMs,
    rate: player.rate,
    playing: player.playing,
    player,
  };
}
