import type { CSSProperties } from "react";
import type { Config } from "@typecaast/schema";
import type { Skin } from "@typecaast/skin-kit";
import { TypecaastStage, useTypecaast } from "@typecaast/react";
import { Controls } from "./Controls.js";
import { TimelineTrack } from "./TimelineTrack.js";
import { ui } from "./theme.js";

export interface BuilderProps {
  config: Config;
  skin: Skin;
  className?: string;
  style?: CSSProperties;
}

const layout: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: ui.bg,
  color: ui.text,
  fontFamily: ui.font,
  borderRadius: 12,
  overflow: "hidden",
  border: `1px solid ${ui.panelBorder}`,
};

const stage: CSSProperties = {
  flex: "1 1 auto",
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: ui.stage,
};

const windowFrame: CSSProperties = {
  width: 460,
  height: 560,
  display: "flex",
  borderRadius: 10,
  overflow: "hidden",
  border: `1px solid ${ui.panelBorder}`,
  boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
};

/**
 * The early builder shell (M1U.11): a live preview driven by the player, a
 * scrub/step/play control bar, and a timeline track of the config's steps —
 * all wired to the mocked engine to feel out the editing UX. Persistence,
 * export, and per-step editing land in M4.
 */
export function Builder({ config, skin, className, style }: BuilderProps) {
  const tc = useTypecaast(config, { capabilities: skin.meta.capabilities });
  const n = config.timeline.length;
  const activeIndex =
    n > 0
      ? Math.min(
          n - 1,
          Math.floor((tc.currentMs / Math.max(1, tc.duration)) * n),
        )
      : -1;

  const onSelect = (i: number) => {
    // Mock phase: steps are spaced proportionally (real times land in M4).
    tc.scrubTo((i / Math.max(1, n)) * tc.duration + 1);
  };

  return (
    <div
      className={className}
      style={{ ...layout, ...style }}
      data-testid="builder"
    >
      <div style={stage}>
        <div style={windowFrame}>
          <TypecaastStage
            state={tc.state}
            skin={skin}
            participants={config.participants}
            options={config.meta.skin.options}
          />
        </div>
      </div>
      <Controls tc={tc} />
      <TimelineTrack
        steps={config.timeline}
        activeIndex={activeIndex}
        onSelect={onSelect}
      />
    </div>
  );
}
