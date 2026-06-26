import Link from "next/link";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { StudioStage } from "../components/StudioStage";
import { GitHubStar } from "../components/GitHubStar";

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
                Simulate a conversation{" "}
                <div className="tc-studio-accent">in real chat UIs</div>
              </h1>
              <p className="tc-studio-sub" style={{ paddingBottom: 12 }}>
                Script a conversation in JSON, then watch it play back in
                popular apps or even your own custom UI. Embed it on your site
                with React or export to MP4.
              </p>
              <p
                className="tc-studio-sub"
                style={{ fontSize: 15, marginBottom: 0 }}
              >
                <em>Finally, an easy way to make demos of AI chatbots!</em>
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
                  Browse demos
                </Link>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                <GitHubStar label="Star on GitHub" />
                <span className="tc-muted" style={{ fontSize: 13 }}>
                  Open source
                </span>
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

        {/* How it works — a flowing, numbered list */}
        <section className="wrap tc-studio-flow">
          <h2 className="tc-studio-flow-title">
            One script. Everything a screenshot can&apos;t do.
          </h2>
          <ol className="tc-studio-steps">
            {FEATURES.map((f, i) => (
              <li key={f.title} className="tc-studio-step">
                <span className="tc-studio-step-n tc-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="tc-studio-step-title">{f.title}</h3>
                  <p className="tc-studio-step-body">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Closing CTA */}
        <section className="wrap tc-studio-closing">
          <h2 className="tc-studio-closing-title">
            Write your bot&apos;s best demo.
          </h2>
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Link
              href="/playground"
              className="tc-btn tc-btn--primary tc-btn--lg"
            >
              Open the playground →
            </Link>
            <Link href="/donate" className="tc-btn tc-btn--outline tc-btn--lg">
              Support the project
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
