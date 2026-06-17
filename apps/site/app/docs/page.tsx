import Link from "next/link";
import { Heading } from "@typecaast/ui";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { DocsViewedTracker } from "../../components/DocsViewedTracker";

const REPO = "https://github.com/corywatilo/typecaast/blob/master";

function Code({ children }: { children: string }) {
  return (
    <pre
      className="tc-mono"
      style={{
        margin: "12px 0",
        padding: 14,
        fontSize: 12.5,
        lineHeight: 1.6,
        background: "var(--tc-bg-subtle)",
        border: "1px solid var(--tc-border)",
        borderRadius: 10,
        overflowX: "auto",
      }}
    >
      {children}
    </pre>
  );
}

export default function DocsPage() {
  return (
    <>
      <DocsViewedTracker />
      <Nav />
      <main className="wrap" style={{ padding: "48px 24px", maxWidth: 760 }}>
        <Heading level={1}>Docs</Heading>
        <p className="tc-muted" style={{ fontSize: 15, marginTop: 8 }}>
          Simulate a chat conversation from one JSON config — embed it live or
          export it to video.
        </p>

        <Heading level={2} style={{ marginTop: 36 }}>
          Install
        </Heading>
        <Code>{`pnpm add @typecaast/react`}</Code>

        <Heading level={2} style={{ marginTop: 28 }}>
          Embed it
        </Heading>
        <Code>{`import { Typecaast } from "@typecaast/react";
import config from "./billing-toast.json";

// The skin comes from config.meta.skin.id (lazy-loaded). Only the serializable
// config is passed, so this works in a Server Component — no "use client".
export default () => <Typecaast config={config} autoplay loop />;`}</Code>

        <Heading level={2} style={{ marginTop: 28 }}>
          Render it to video
        </Heading>
        <Code>{`pnpm add -g @typecaast/cli
typecaast render billing-toast.json --aspect 9:16 --scale 2 --theme dark`}</Code>

        <Heading level={2} style={{ marginTop: 28 }}>
          The config
        </Heading>
        <p className="tc-muted" style={{ fontSize: 14, lineHeight: 1.7 }}>
          A versioned, Zod-validated JSON document: <code>meta</code> (canvas,
          fps, fit, theme, skin), <code>participants</code>, optional{" "}
          <code>pacing</code>, and a <code>timeline</code> of steps — message,
          reaction, typing, composerType, send, edit, delete, readReceipt,
          system, delay. Validate it with{" "}
          <code className="tc-mono">typecaast validate</code>.
        </p>

        <Heading level={2} style={{ marginTop: 28 }}>
          Guides
        </Heading>
        <ul style={{ fontSize: 14.5, lineHeight: 2 }}>
          <li>
            <Link
              style={{ color: "var(--tc-accent)" }}
              href={`${REPO}/docs/playground.md`}
            >
              Playground tour →
            </Link>
          </li>
          <li>
            <Link
              className="tc-link"
              style={{ color: "var(--tc-accent)" }}
              href={`${REPO}/docs/authoring-skins.md`}
            >
              Build a skin →
            </Link>
          </li>
          <li>
            <Link
              style={{ color: "var(--tc-accent)" }}
              href={`${REPO}/docs/RENDERING.md`}
            >
              Rendering video →
            </Link>
          </li>
          <li>
            <Link
              style={{ color: "var(--tc-accent)" }}
              href={`${REPO}/PLAN.md`}
            >
              The full design spec →
            </Link>
          </li>
        </ul>
      </main>
      <Footer />
    </>
  );
}
