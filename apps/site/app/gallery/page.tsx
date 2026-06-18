"use client";

import { useEffect, useMemo, useState } from "react";
import type { ThemeMode } from "@typecaast/schema";
import { builtinSkins } from "@typecaast/skins";
import { Button, Heading, Segmented } from "@typecaast/ui";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { LiveSim } from "../../components/LiveSim";
import { JsonModal } from "../../components/JsonModal";
import { agentConfig, genericConfig } from "../../lib/configs";
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

  // A counter folded into each player's key — bumping it remounts every card,
  // replaying the script from the top. Each card otherwise rests on its final
  // frame (no loop), so the gallery is calm until you ask it to play.
  const [runKey, setRunKey] = useState(0);
  // Theme applied to the preview widgets only — independent of the page/OS
  // theme, so you can compare a skin's light and dark rendering on one page.
  const [widgetTheme, setWidgetTheme] = useState<ThemeMode>("auto");
  const [modal, setModal] = useState<{ title: string; json: string } | null>(
    null,
  );

  // Explicit card order — each wide (2-col) skin paired with the narrow (1-col)
  // skin beside it, so the 3-col `grid-auto-flow: dense` layout lays them out
  // as: slack+telegram, claude-code+cursor, messages+imessage, discord+whatsapp.
  // Any skin not listed is appended so a new built-in never silently vanishes.
  const cards = useMemo(() => {
    const ORDER = [
      "slack",
      "telegram",
      "claude-code",
      "cursor",
      "messages-macos",
      "imessage",
      "discord",
      "whatsapp",
    ];
    const ids = [
      ...ORDER.filter((id) => id in builtinSkins),
      ...Object.keys(builtinSkins).filter((id) => !ORDER.includes(id)),
    ];
    return ids.map((id) => {
      const skin = builtinSkins[id as keyof typeof builtinSkins];
      const canvas = skin.meta.defaultCanvas;
      // Landscape skins (desktop chat windows) span 2 grid cols; portrait
      // skins (phone-shaped messengers) span 1, so each card's on-screen size
      // matches the proportions of the platform it represents.
      const aspect: "wide" | "tall" =
        canvas.width / canvas.height >= 1 ? "wide" : "tall";
      // Claude Code & Cursor are single-human-↔-AI tools, not multiplayer
      // chats — they play the assistant script.
      const config =
        id === "claude-code" || id === "cursor"
          ? agentConfig(id, canvas, SAMPLE_OPTIONS[id])
          : genericConfig(id, canvas, SAMPLE_OPTIONS[id]);
      return { id, skin, canvas, aspect, config };
    });
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
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRunKey((k) => k + 1)}
          >
            ↻ Restart
          </Button>
          <Segmented<ThemeMode>
            aria-label="Preview theme"
            value={widgetTheme}
            onChange={setWidgetTheme}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
        <div className="tc-gallery" style={{ marginTop: 28 }}>
          {cards.map(({ id, skin, canvas, aspect, config }) => {
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
                    key={`${id}-${runKey}`}
                    config={config}
                    skin={skin}
                    theme={widgetTheme}
                    fit="scale"
                    composer="always"
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      track("gallery_json_viewed");
                      setModal({
                        title: skin.meta.name,
                        json: JSON.stringify(config, null, 2),
                      });
                    }}
                  >
                    View JSON
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
      {modal ? (
        <JsonModal
          title={modal.title}
          json={modal.json}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}
