"use client";

import { useEffect, useState } from "react";
import { GitHubIcon } from "./icons";

const REPO_URL = "https://github.com/corywatilo/typecaast";

/**
 * "Star on GitHub" button — links to the repo and shows the live star count
 * (fetched once, client-side, from our cached `/api/github-stars` route). The
 * count is best-effort: if the fetch fails it simply renders without one. Works
 * in both server-rendered pages and the client-only playground header.
 */
export function GitHubStar({
  label = "Star",
  size = "sm",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/github-stars")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.stars === "number") setStars(d.stars);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      className={`tc-btn tc-btn--outline tc-btn--${size}`}
      aria-label="Star Typecaast on GitHub"
    >
      <GitHubIcon />
      <span>{label}</span>
      {stars != null ? (
        <span
          style={{
            paddingLeft: 8,
            borderLeft: "1px solid var(--tc-border)",
            color: "var(--tc-text-muted)",
            fontVariantNumeric: "tabular-nums",
            fontSize: "0.92em",
          }}
        >
          {new Intl.NumberFormat("en", { notation: "compact" }).format(stars)}
        </span>
      ) : null}
    </a>
  );
}
