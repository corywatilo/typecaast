import Link from "next/link";
import { ManageAnalyticsLink } from "../lib/analytics";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--tc-border)",
        marginTop: 96,
        padding: "40px 0",
      }}
    >
      <div
        className="wrap"
        style={{ display: "flex", flexWrap: "wrap", gap: 24 }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Logo className="tc-logo" />
            <strong style={{ fontSize: 15 }}>Typecaast</strong>
          </div>
          <p
            className="tc-muted"
            style={{
              fontSize: 12.5,
              maxWidth: 420,
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            Trademarks belong to their owners. Typecaast is an independent,
            unaffiliated tool and is not endorsed by them.
          </p>
          <p className="tc-muted" style={{ fontSize: 12.5, marginTop: 8 }}>
            Runtime: Apache-2.0 (open source). Builder: FSL-1.1-Apache-2.0
            (source-available).
          </p>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 13 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="tc-label">Product</span>
            <Link href="/playground" className="tc-muted">
              Playground
            </Link>
            <Link href="/gallery" className="tc-muted">
              Gallery
            </Link>
            <Link href="/docs" className="tc-muted">
              Docs
            </Link>
            <Link href="/donate" className="tc-muted">
              Support
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="tc-label">Open source</span>
            <a
              href="https://github.com/corywatilo/typecaast"
              className="tc-muted"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://github.com/corywatilo/typecaast/blob/master/LICENSING.md"
              className="tc-muted"
              target="_blank"
              rel="noreferrer"
            >
              Licensing
            </a>
            <a
              href="https://x.com/intent/follow?screen_name=ninepixelgrid"
              className="tc-muted"
              target="_blank"
              rel="noreferrer"
            >
              Follow on X
            </a>
            <ManageAnalyticsLink className="tc-muted" />
          </div>
        </div>
      </div>
      <div
        className="wrap"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--tc-border)",
        }}
      >
        <span className="tc-muted" style={{ fontSize: 12.5 }}>
          © Typecaast
        </span>
        <ThemeToggle />
      </div>
    </footer>
  );
}
