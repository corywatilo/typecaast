"use client";

import { useEffect, useMemo } from "react";
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

  // Order cards so wide (2-col) and narrow (1-col) skins alternate. Combined
  // with the 3-col `grid-auto-flow: dense` layout this packs each wide+narrow
  // pair into one clean row, instead of stranding trailing wide cards on
  // half-empty rows when all the narrow skins were paired up earlier.
  const cards = useMemo(() => {
    const all = Object.entries(builtinSkins).map(([id, skin]) => {
      const canvas = skin.meta.defaultCanvas;
      // Landscape skins (desktop chat windows) span 2 grid cols; portrait
      // skins (phone-shaped messengers) span 1, so each card's on-screen size
      // matches the proportions of the platform it represents.
      const aspect: "wide" | "tall" =
        canvas.width / canvas.height >= 1 ? "wide" : "tall";
      return { id, skin, canvas, aspect };
    });
    const wide = all.filter((c) => c.aspect === "wide");
    const tall = all.filter((c) => c.aspect === "tall");
    const out: typeof all = [];
    for (let i = 0; i < Math.max(wide.length, tall.length); i++) {
      if (wide[i]) out.push(wide[i]!);
      if (tall[i]) out.push(tall[i]!);
    }
    return out;
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
        <div className="tc-gallery" style={{ marginTop: 32 }}>
          {cards.map(({ id, skin, canvas, aspect }) => {
            return (
              <div
                key={id}
                className="tc-panel"
                data-aspect={aspect}
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
