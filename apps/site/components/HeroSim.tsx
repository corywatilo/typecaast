"use client";

import { slack } from "@typecaast/skins";
import { LiveSim } from "./LiveSim";
import { billingToast } from "../lib/configs";

export function HeroSim() {
  return (
    <div
      style={{
        width: 480,
        maxWidth: "100%",
        height: 640,
        display: "flex",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--tc-border)",
        boxShadow: "var(--tc-shadow)",
        background: "var(--tc-panel)",
      }}
    >
      <LiveSim config={billingToast} skin={slack} theme="light" />
    </div>
  );
}
