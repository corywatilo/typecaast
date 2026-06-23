import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { StudioStage } from "../components/StudioStage";

const FEATURES = [
  {
    title: "Script it beat by beat",
    body: "Messages, typing, reactions, the agentic reply and the result card — arrange the whole take in a visual timeline until it lands.",
  },
  {
    title: "A version for every persona",
    body: "Fork the script, swap who's talking and what the bot says, and keep each variation a click away.",
  },
  {
    title: "Embed it or export it",
    body: "One script, two outputs: a live React component you drop on a page, or a deterministic MP4 — the exact same frames.",
  },
  {
    title: "It's code, so it won't go stale",
    body: "Built from real components — even captured from your own site's HTML — so when your product's UI changes, the demo follows. No human re-rendering.",
  },
];

export default function Home() {
  return (
    <div className="tc-studio">
      <Nav />
      <main>
        {/* Hero */}
        <section className="wrap tc-studio-hero">
          <div className="tc-studio-hero-grid">
            <div>
              <h1 className="tc-studio-h1">
                Demo your AI bot{" "}
                <span className="tc-studio-accent">
                  without faking screenshots.
                </span>
              </h1>
              <p className="tc-studio-sub">
                Script the conversation — the question, your bot typing, the
                reply, the result card — and Typecaast plays it back in a
                pixel-perfect Slack. Embed it live on your site or export an
                MP4. Change a line, both update.
              </p>
              <div className="tc-studio-cta">
                <Link
                  href="/playground"
                  className="tc-btn tc-btn--primary tc-btn--lg"
                >
                  Open the playground →
                </Link>
                <Link
                  href="/gallery"
                  className="tc-btn tc-btn--outline tc-btn--lg"
                >
                  Browse examples
                </Link>
              </div>
            </div>
            <div className="tc-studio-stage-col">
              <StudioStage />
            </div>
          </div>
        </section>

        {/* Statement band */}
        <section className="tc-studio-band">
          <p className="wrap tc-studio-band-text">
            No screenshots. No re-shoots.{" "}
            <span className="tc-muted">
              Script it once — rewrite a line and every embed and export
              updates.
            </span>
          </p>
        </section>

        {/* Features */}
        <section className="wrap tc-studio-features">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="tc-studio-card">
              <span className="tc-studio-card-n tc-mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="tc-studio-card-title">{f.title}</h2>
              <p className="tc-studio-card-body">{f.body}</p>
            </div>
          ))}
        </section>

        {/* Closing CTA */}
        <section className="wrap tc-studio-closing">
          <h2 className="tc-studio-closing-title">
            Write your bot&apos;s best demo.
          </h2>
          <Link
            href="/playground"
            className="tc-btn tc-btn--primary tc-btn--lg"
          >
            Open the playground →
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
