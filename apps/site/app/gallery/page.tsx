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
        <div className="tc-masonry" style={{ marginTop: 32 }}>
          {Object.entries(builtinSkins).map(([id, skin]) => {
            const canvas = skin.meta.defaultCanvas;
            // Each card's preview slot uses the skin's authored canvas
            // aspect-ratio — so a wide Slack thread renders short, an
            // iMessage device renders tall, and `fit="scale"` fills each
            // edge-to-edge with no letterbox. The masonry column layout
            // packs the differently-sized cards.
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
                    width: "100%",
                    aspectRatio: `${canvas.width} / ${canvas.height}`,
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
