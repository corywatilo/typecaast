/**
 * PostHog reverse-proxy ingest (PLAN §27): the browser talks to same-origin
 * `/ingest/*`, which Next rewrites to PostHog's ingestion + asset hosts. This
 * keeps ad-blockers from dropping analytics and keeps the third-party host off
 * the page. Destination is derived from NEXT_PUBLIC_POSTHOG_HOST (region-aware);
 * with no host set it defaults to US and stays a harmless no-op until a key is
 * present client-side.
 */
const INGEST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const ASSETS = INGEST.replace(/\/\/([a-z]+)\.i\./, "//$1-assets.i.");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy needs trailing slashes preserved or PostHog's API 308-redirects.
  skipTrailingSlashRedirect: true,
  // We lint with the repo's flat ESLint config separately.
  eslint: { ignoreDuringBuilds: true },
  // Workspace packages ship compiled dist; transpile the FSL UI/builder anyway
  // so their JSX/CSS resolve cleanly in the Next build.
  transpilePackages: [
    "@typecaast/ui",
    "@typecaast/builder",
    "@typecaast/react",
    "@typecaast/skins",
    "@typecaast/skin-kit",
  ],
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${ASSETS}/static/:path*`,
      },
      { source: "/ingest/:path*", destination: `${INGEST}/:path*` },
    ];
  },
};

export default nextConfig;
