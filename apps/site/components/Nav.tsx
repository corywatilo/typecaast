import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { Logo } from "./Logo";

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
          <Logo className="tc-logo" />
          <strong style={{ fontSize: 16, letterSpacing: "-0.01em" }}>
            Typecaast
          </strong>
        </Link>
        <NavLinks style={{ marginLeft: "auto" }} />
      </div>
    </header>
  );
}
