"use client";

import { slack } from "@typecaast/skins";
import { LiveSim } from "./LiveSim";
import { billingToast } from "../lib/configs";
import { useResolvedSiteTheme } from "../lib/theme";

/**
 * The hero "stage": the live Slack demo framed like a screen on a set — glowing
 * under a warm studio light, on a faint grid, looping so it's obviously running.
 * The skin theme follows the site's light/dark toggle.
 */
export function StudioStage() {
  const theme = useResolvedSiteTheme();
  return (
    <div className="tc-stage">
      <div className="tc-stage-glow" aria-hidden />
      <div className="tc-stage-grid" aria-hidden />
      <div className="tc-stage-screen">
        <LiveSim
          config={billingToast}
          skin={slack}
          theme={theme}
          fit="scale"
          autoplay
        />
      </div>
      <span className="tc-stage-live tc-mono" aria-hidden>
        <span className="tc-stage-live-dot" /> live
      </span>
    </div>
  );
}
