import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * The site's primary nav links — the single source of truth, shared by the site
 * header (`Nav`) and the playground's Builder header (passed in as `headerNav`)
 * so the link set is maintained in one place.
 */
export function NavLinks({ style }: { style?: CSSProperties }) {
  return (
    <nav
      className="tc-muted"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontSize: 14,
        ...style,
      }}
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
  );
}
