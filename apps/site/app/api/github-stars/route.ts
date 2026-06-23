import { NextResponse } from "next/server";

const REPO_API = "https://api.github.com/repos/corywatilo/typecaast";

// Cache the count for an hour so a launch-day traffic spike makes at most one
// GitHub API call per hour (unauthenticated GitHub requests are rate-limited
// per IP), shared across all visitors via Vercel's cache.
export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(REPO_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "typecaast-site",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ stars: null });
    const data = (await res.json()) as { stargazers_count?: number };
    const stars =
      typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    return NextResponse.json(
      { stars },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ stars: null });
  }
}
