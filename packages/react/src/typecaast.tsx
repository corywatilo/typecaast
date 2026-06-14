import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import type { Config, FitMode, ThemeMode } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { useTypecaast } from "./use-typecaast.js";
import { useSkinFonts } from "./use-skin-fonts.js";
import { useReducedMotion } from "./use-reduced-motion.js";
import { buildTranscript } from "./transcript.js";
import { TypecaastStage, type ComposerMode } from "./stage.js";
import { FitBox } from "./fit-box.js";

export interface TypecaastProps {
  config: Config;
  skin: Skin;
  /** Force a theme; otherwise resolved from `config.meta.theme`. */
  theme?: ThemeMode;
  autoplay?: boolean;
  loop?: boolean;
  rate?: number;
  /** Container fit mode; defaults to `config.meta.fit`. */
  fit?: FitMode;
  /** Composer (reply box) visibility: `auto` (default) / `always` / `never`. */
  composer?: ComposerMode;
  /** Accessible label for the simulation. */
  label?: string;
  className?: string;
  style?: CSSProperties;
}

const SR_ONLY: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Mounts the real-time player and renders the resolved skin from live state.
 * The animated visuals are `aria-hidden`; an accessible transcript carries the
 * conversation for screen readers, and `prefers-reduced-motion` snaps to the
 * final state instead of animating (PLAN §20).
 */
export function Typecaast({
  config,
  skin,
  theme,
  autoplay,
  loop,
  rate,
  fit,
  composer,
  label,
  className,
  style,
}: TypecaastProps): ReactNode {
  const reduced = useReducedMotion();
  const tc = useTypecaast(config, {
    theme,
    autoplay: autoplay && !reduced,
    loop: loop && !reduced,
    rate,
    capabilities: skin.meta.capabilities,
  });
  const fonts = useSkinFonts(skin);

  // Reduced motion: hold the completed conversation, no animation.
  useEffect(() => {
    if (reduced) tc.seek(tc.duration);
  }, [reduced, tc]);

  const transcript = useMemo(() => buildTranscript(config), [config]);

  return (
    <div
      className={className}
      style={{ position: "relative", ...style }}
      data-typecaast=""
      data-fonts={fonts}
      role="figure"
      aria-label={label ?? `Chat simulation (${skin.meta.name})`}
    >
      <ol style={SR_ONLY}>
        {transcript.map((line, i) => (
          <li key={i}>
            {line.name}: {line.text}
          </li>
        ))}
      </ol>
      <div aria-hidden="true" style={{ height: "100%" }}>
        <FitBox fit={fit ?? config.meta.fit} canvas={config.meta.canvas}>
          <TypecaastStage
            state={tc.state}
            skin={skin}
            participants={config.participants}
            options={config.meta.skin.options}
            composer={composer ?? config.meta.composer}
          />
        </FitBox>
      </div>
    </div>
  );
}
