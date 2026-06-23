"use client";

import { useState } from "react";
import { slack, telegram, claudeCode, cursor } from "@typecaast/skins";
import { Segmented } from "@typecaast/ui";
import type { Skin } from "@typecaast/skin-kit";
import type { ConfigInput } from "@typecaast/schema";
import { LiveSim } from "./LiveSim";
import {
  slackHero,
  telegramHero,
  claudeCodeHero,
  cursorHero,
} from "../lib/hero-scripts";
import { useResolvedSiteTheme } from "../lib/theme";

type TabId = "slack" | "claude-code" | "cursor" | "telegram";

const TABS: { id: TabId; label: string; skin: Skin; config: ConfigInput }[] = [
  { id: "slack", label: "Slack", skin: slack, config: slackHero },
  {
    id: "claude-code",
    label: "Claude Code",
    skin: claudeCode,
    config: claudeCodeHero,
  },
  { id: "cursor", label: "Cursor", skin: cursor, config: cursorHero },
  { id: "telegram", label: "Telegram", skin: telegram, config: telegramHero },
];

/**
 * The hero "stage": a live demo framed like a screen on a set — glowing under a
 * warm studio light, on a faint grid. A tab bar switches the *app* (Slack, the
 * coding agents, Telegram); each tab plays a script tuned to what that skin can
 * render. `fit="reflow"` + `isolate` keep text at native size and seal the
 * widget from the page's CSS; the skin theme follows the site's light/dark.
 */
export function StudioStage() {
  const theme = useResolvedSiteTheme();
  const [active, setActive] = useState<TabId>("slack");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <div className="tc-stage">
      <div className="tc-stage-glow" aria-hidden />
      <div className="tc-stage-grid" aria-hidden />
      <div className="tc-stage-shell">
        <Segmented
          className="tc-stage-tabs"
          aria-label="Choose an app"
          value={active}
          onChange={setActive}
          options={TABS.map((t) => ({ value: t.id, label: t.label }))}
        />
        <div className="tc-stage-screen">
          <LiveSim
            key={active}
            config={tab.config}
            skin={tab.skin}
            theme={theme}
            fit="reflow"
            isolate
            autoplay
          />
        </div>
      </div>
    </div>
  );
}
