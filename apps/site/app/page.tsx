import Link from "next/link";
import { Badge, Heading } from "@typecaast/ui";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { HeroSim } from "../components/HeroSim";

const SKINS = [
  "Slack",
  "iMessage",
  "Messages (macOS)",
  "WhatsApp",
  "Discord",
  "Claude Code (TUI)",
  "Cursor panel",
];

function Feature({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="tc-panel"
      style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8 }}
    >
      <Heading level={2}>{title}</Heading>
      <p className="tc-muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="wrap" style={{ padding: "72px 24px 48px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div>
              <Badge tone="accent">Open-core · early beta</Badge>
              <Heading
                level={0}
                style={{ marginTop: 18, marginBottom: 18, maxWidth: 640 }}
              >
                Simulate &amp; record chat interactions in the UIs people know.
              </Heading>
              <p
                className="tc-muted"
                style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}
              >
                Script a conversation once — typing, reactions, a reply being
                sent — and play it back inside a pixel-faithful Slack, iMessage,
                terminal, or your own captured UI. Drop a{" "}
                <code className="tc-mono">&lt;Typecaast&gt;</code> on a page, or
                export an MP4. One JSON config, two render targets, identical
                frames.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                <Link
                  href="/playground"
                  className="tc-btn tc-btn--primary tc-btn--lg"
                >
                  Open the playground →
                </Link>
                <a
                  href="https://github.com/corywatilo/typecaast"
                  className="tc-btn tc-btn--outline tc-btn--lg"
                  target="_blank"
                  rel="noreferrer"
                >
                  View on GitHub
                </a>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <HeroSim />
            </div>
          </div>
        </section>

        {/* Skins strip */}
        <section className="wrap" style={{ padding: "8px 24px 24px" }}>
          <p
            className="tc-label"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            Pixel-faithful presets, light &amp; dark
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
            }}
          >
            {SKINS.map((s) => (
              <span
                key={s}
                className="tc-badge"
                style={{ height: 28, fontSize: 13 }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          className="wrap"
          style={{
            padding: "48px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          <Feature title="Embed it live">
            A real React component with a real-time player.
            `theme=&quot;auto&quot;` follows the page, fonts load so it looks
            right everywhere.
          </Feature>
          <Feature title="Export it to video">
            The same engine + skins render deterministically through Remotion to
            MP4/GIF/WebM — frame-for-frame identical to the live preview.
          </Feature>
          <Feature title="Build any UI">
            Hand-authored presets, a public skin contract, a scaffold, and an AI
            skill — anyone can add a platform.
          </Feature>
        </section>
      </main>
      <Footer />
    </>
  );
}
