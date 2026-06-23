import Link from "next/link";
import type { CSSProperties } from "react";
import { GitHubStar } from "./GitHubStar";
import { GitHubLink } from "./GitHubLink";
import { XFollow } from "./XFollow";

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
      <Link href="/gallery">Demos</Link>
      <Link href="/docs">Docs</Link>
      <Link href="/donate">Support</Link>
      {/* The GitHub star button doubles as the repo link (replacing the old
          plain "GitHub" text link); the X follow sits beside it. */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <GitHubStar />
        {/* The two icon-only links read as one social cluster — keep them tight. */}
        <span style={{ display: "inline-flex", alignItems: "center" }}>
          <GitHubLink />
          <XFollow />
        </span>
      </span>
    </nav>
  );
}
