import Link from "next/link";
import { Badge } from "@typecaast/ui";

export function Nav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid var(--tc-border)",
        background: "color-mix(in srgb, var(--tc-bg) 80%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="wrap"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          height: 56,
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <strong style={{ fontSize: 16, letterSpacing: "-0.01em" }}>
            Typecaast
          </strong>
          <Badge tone="accent">beta</Badge>
        </Link>
        <nav
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontSize: 14,
          }}
          className="tc-muted"
        >
          <Link href="/playground">Playground</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/docs">Docs</Link>
          <a
            href="https://github.com/corywatilo/typecaast"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
