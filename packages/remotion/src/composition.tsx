import { useMemo, type ReactNode } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { createEngine, type ResolvedTheme } from "@typecaast/core";
import { TypecaastStage } from "@typecaast/react";
import type { Config } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { frameToMs } from "./timing.js";

export interface TypecaastCompositionProps {
  config: Config;
  skin: Skin;
  /** Resolved theme (`auto` isn't meaningful for a fixed video; default light). */
  theme?: ResolvedTheme;
  /** Background; defaults to `config.meta.background` (`transparent`). */
  background?: string;
}

/**
 * The Remotion composition: maps the current frame to a timestamp, samples the
 * **same** pure `getStateAt`, and renders the **same** skin via `TypecaastStage`
 * as the live React player (PLAN §9). Because both renderers ask the same pure
 * function for the same time, the preview and the export are frame-identical.
 */
export function TypecaastComposition({
  config,
  skin,
  theme = "light",
  background,
}: TypecaastCompositionProps): ReactNode {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const engine = useMemo(
    () => createEngine(config, theme, skin.meta.capabilities),
    [config, theme, skin],
  );
  const state = engine.getStateAt(frameToMs(frame, fps));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: background ?? config.meta.background ?? "transparent",
      }}
    >
      <TypecaastStage
        state={state}
        skin={skin}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </div>
  );
}
