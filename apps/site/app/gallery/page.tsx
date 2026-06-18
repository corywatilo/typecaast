"use client";

import { useEffect } from "react";
import { builtinSkins } from "@typecaast/skins";
import { Badge, Heading } from "@typecaast/ui";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { LiveSim } from "../../components/LiveSim";
import { genericConfig } from "../../lib/configs";
import { track } from "../../lib/analytics";

const SAMPLE_OPTIONS: Record<string, Record<string, unknown>> = {
  slack: { channel: "#team" },
  telegram: { title: "Team", status: "online" },
  discord: { channel: "team" },
  "claude-code": { title: "claude — zsh" },
  cursor: { title: "Chat" },
  imessage: { contact: "Sam" },
  "messages-macos": { contact: "Sam" },
  whatsapp: { contact: "Sam", status: "online" },
};

export default function GalleryPage() {
  useEffect(() => {
    track("gallery_viewed");
  }, []);

  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "48px 24px" }}>
        <Heading level={1}>Skin gallery</Heading>
        <p
          className="tc-muted"
          style={{ fontSize: 15, marginTop: 8, maxWidth: 620 }}
        >
          Every preset, playing the same script. Official skins are first-party;
          community skins are a directory, not an endorsement.
        </p>
        <div
          style={{
            marginTop: 32,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {Object.entries(builtinSkins).map(([id, skin]) => {
            const canvas = skin.meta.defaultCanvas;
            const ratio = canvas.width / canvas.height;
            // Each card has a fixed-height preview slot; `<Typecaast>` now
            // fills it (width: 100% / height: 100%) and `fit="scale"`
            // renders the skin at its authored canvas, scaled to fit —
            // exactly like the hero. `min(420, …)` keeps the tall
            // portrait skins from blowing the grid out vertically.
            const h = Math.min(420, Math.round(280 / ratio));
            return (
              <div
                key={id}
                className="tc-panel"
                style={{
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: h,
                    display: "flex",
                    overflow: "hidden",
                    background: "var(--tc-bg-subtle)",
                  }}
                >
                  <LiveSim
                    config={genericConfig(id, canvas, SAMPLE_OPTIONS[id])}
                    skin={skin}
                    theme="auto"
                    fit="scale"
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 12px",
                    borderTop: "1px solid var(--tc-border)",
                  }}
                >
                  <strong style={{ fontSize: 13.5, flex: 1 }}>
                    {skin.meta.name}
                  </strong>
                  {skin.meta.supportsThemes.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
