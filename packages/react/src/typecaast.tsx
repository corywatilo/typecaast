import type { CSSProperties, ReactNode } from "react";
import type { Config, FitMode, ThemeMode } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { useTypecaast } from "./use-typecaast.js";
import { TypecaastStage } from "./stage.js";

export interface TypecaastProps {
  config: Config;
  skin: Skin;
  /** Force a theme; otherwise resolved from `config.meta.theme`. */
  theme?: ThemeMode;
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
  /** Container fit mode (wired in M1U.6); defaults to `config.meta.fit`. */
  fit?: FitMode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mounts the real-time player and renders the resolved skin from live state.
 * Ticks via the player's clock and samples the engine each frame (mocked in
 * M1-UI, real from M1-engine — same component, no changes).
 */
export function Typecaast({
  config,
  skin,
  theme,
  autoplay,
  loop,
  rate,
  className,
  style,
}: TypecaastProps): ReactNode {
  const { state } = useTypecaast(config, { theme, autoplay, loop, rate });
  return (
    <div className={className} style={style} data-typecaast="">
      <TypecaastStage
        state={state}
        skin={skin}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </div>
  );
}
