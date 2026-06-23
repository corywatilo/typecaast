import Link from "next/link";
import { Heading } from "@typecaast/ui";
import { Nav } from "../../../components/Nav";
import { Footer } from "../../../components/Footer";
import { XFollow } from "../../../components/XFollow";

export const metadata = {
  title: "Thank you — Typecaast",
};

export default function DonateThanksPage() {
  return (
    <>
      <Nav />
      <main
        className="wrap"
        style={{ padding: "96px 24px", maxWidth: 620, textAlign: "center" }}
      >
        <Heading level={1}>Thank you 💛</Heading>
        <p
          className="tc-muted"
          style={{ fontSize: 16, marginTop: 12, lineHeight: 1.6 }}
        >
          Your support means a lot — it directly helps keep Typecaast free, open
          source, and improving.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 28,
          }}
        >
          <Link href="/" className="tc-btn tc-btn--primary tc-btn--lg">
            Back to home
          </Link>
          <Link
            href="/playground"
            className="tc-btn tc-btn--outline tc-btn--lg"
          >
            Open the playground →
          </Link>
        </div>
        <div
          style={{
            marginTop: 40,
            paddingTop: 28,
            borderTop: "1px solid var(--tc-border)",
          }}
        >
          <p
            className="tc-muted"
            style={{ fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}
          >
            Want to follow along? I post updates on X.
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <XFollow size="lg" showLabel />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
