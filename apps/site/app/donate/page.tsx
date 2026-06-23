import { Heading } from "@typecaast/ui";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { GitHubStar } from "../../components/GitHubStar";
import { XFollow } from "../../components/XFollow";
import { DONATE_PRESETS, DONATE_CUSTOM_URL } from "../../lib/donate";

export const metadata = {
  title: "Support Typecaast",
  description:
    "Typecaast is free and open source. Chip in a one-time donation to support its development.",
};

export default function DonatePage() {
  return (
    <>
      <Nav />
      <main className="wrap" style={{ padding: "64px 24px", maxWidth: 680 }}>
        <Heading level={1}>Support Typecaast</Heading>
        <p
          className="tc-muted"
          style={{
            fontSize: 16,
            marginTop: 10,
            lineHeight: 1.6,
            maxWidth: "54ch",
          }}
        >
          Typecaast is free and open source. A one-time gift helps cover the
          time and hosting that keep it going and improving. No subscriptions,
          no account — just a thank-you.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 12,
            marginTop: 28,
          }}
        >
          {DONATE_PRESETS.map((p) => (
            <a
              key={p.amount}
              href={p.url}
              className="tc-btn tc-btn--outline tc-btn--lg"
            >
              ${p.amount}
            </a>
          ))}
        </div>

        <a
          href={DONATE_CUSTOM_URL}
          className="tc-btn tc-btn--primary tc-btn--lg"
          style={{ width: "100%", marginTop: 12 }}
        >
          Choose another amount →
        </a>

        <p className="tc-muted" style={{ fontSize: 12.5, marginTop: 14 }}>
          Payments are processed securely by Stripe. One-time only — you won’t
          be charged again.
        </p>

        <div
          style={{
            marginTop: 44,
            paddingTop: 28,
            borderTop: "1px solid var(--tc-border)",
          }}
        >
          <span className="tc-label">Other ways to help</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 14,
              alignItems: "center",
            }}
          >
            <GitHubStar label="Star on GitHub" size="md" />
            <XFollow size="md" showLabel />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
