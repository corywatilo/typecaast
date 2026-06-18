import Link from "next/link";
import { Badge } from "@typecaast/ui";
import { NavLinks } from "./NavLinks";

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
        <NavLinks style={{ marginLeft: "auto" }} />
      </div>
    </header>
  );
}
