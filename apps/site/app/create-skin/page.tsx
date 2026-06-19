import { ThemeToggle } from "../../components/ThemeToggle";
import { NavLinks } from "../../components/NavLinks";
import { EditorMount } from "./EditorMount";

export const metadata = {
  title: "Create a skin · Typecaast",
  description:
    "Drop a captured chat UI, paste your own HTML+CSS, or start from a built-in — see the result against a dummy conversation, then export a ready-to-ship skin.",
};

export default function CreateSkinPage() {
  return (
    <div
      style={{
        height: "100dvh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          flex: "0 0 auto",
          height: 52,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          borderBottom: "1px solid var(--tc-border)",
          gap: 22,
        }}
      >
        <a
          href="/"
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: "var(--tc-text)",
            textDecoration: "none",
          }}
        >
          Typecaast
        </a>
        <span
          className="tc-muted"
          style={{
            fontSize: 11,
            padding: "2px 7px",
            border: "1px solid var(--tc-border)",
            borderRadius: 999,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Create skin
        </span>
        <NavLinks style={{ marginLeft: 22 }} />
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </header>
      <div style={{ flex: "1 1 auto", minHeight: 0 }}>
        <EditorMount />
      </div>
    </div>
  );
}
