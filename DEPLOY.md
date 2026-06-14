# Deploy runbook

The hosted site (`apps/site`) deploys to **Vercel**, with DNS + TLS via
**Cloudflare** and analytics via **PostHog**. No secrets live in this file — all
tokens/keys are environment variables (`.env` / `.env.local`, gitignored; Vercel
project env for builds).

## Topology

- **Vercel project:** `typecaast-web` (team `watilo`), Git-connected to
  `corywatilo/typecaast`, production branch `master`.
  - Root directory: `apps/site`
  - Framework: `nextjs`
  - Install: `pnpm install --frozen-lockfile`
  - Build: `cd ../.. && pnpm turbo run build --filter=@typecaast/site`
  - Env (production/preview/development): `NEXT_PUBLIC_POSTHOG_KEY`,
    `NEXT_PUBLIC_POSTHOG_HOST`
- **Domain:** `typecaast.com` (apex, production) + `www.typecaast.com` (→ apex
  redirect).
- **Cloudflare zone `typecaast.com`:**
  - `A typecaast.com → 216.198.79.1` and `→ 64.29.17.1` (Vercel apex), **DNS-only**
  - `CNAME www → cname.vercel-dns.com`, **DNS-only**
  - SSL/TLS mode: **Full (strict)**
  - Records are DNS-only so Vercel's HTTP-01 cert challenge isn't intercepted.
    To put Cloudflare's CDN/WAF in front, flip the records to **Proxied** after
    the Vercel cert has issued (SSL must stay Full (strict)).
- **PostHog:** US region, **reverse-proxied** at `/ingest` (see
  `apps/site/next.config.mjs`). The project API key is publishable. See
  [`ANALYTICS.md`](./ANALYTICS.md) for the event model + consent.

## Deploys

- **Production:** push to `master` → Vercel auto-deploys (or trigger a redeploy
  in the Vercel dashboard).
- **Previews:** every PR against `master` gets an automatic preview deployment.

## Publishing to npm (Trusted Publishing / OIDC)

Packages publish from `.github/workflows/release.yml` via **npm trusted
publishing** — no long-lived `NPM_TOKEN`. The workflow has `id-token: write`;
pnpm (≥11.0.9, which has the OIDC fix) exchanges a GitHub OIDC token for npm
credentials, and npm validates it against each package's **trusted publisher**.
Provenance is attached automatically.

**One-time setup per package** (on npmjs.com, for each published `@typecaast/*`
package + `create-typecaast-skin`): package **Settings → Trusted Publishing →
Add → GitHub Actions**, with:

- Organization / user: `corywatilo`
- Repository: `typecaast`
- Workflow filename: `release.yml`
- Environment: _(leave blank)_

Packages: `core`, `schema`, `react`, `remotion`, `skins`, `skin-kit`,
`capture`, `cli`, `builder` (and `create-typecaast-skin`).

Once configured, the old `NPM_TOKEN` repo secret is unused and can be **revoked**
on npm. Trusted publishing only kicks in on a real version bump (a merged
"Version Packages" PR); a push with no changesets publishes nothing.

> If a future publish 404s on auth, confirm the package's trusted publisher
> matches the repo + `release.yml`, and that pnpm is ≥ 11.0.9.

## First-time provisioning (already done)

1. Vercel project linked to the repo; root dir / framework / build set.
2. Vercel env vars set for all targets.
3. `typecaast.com` + `www.typecaast.com` added to the project.
4. Cloudflare A/CNAME records created (DNS-only); SSL set to Full (strict).
5. Verified `https://typecaast.com` serves 200 and `/ingest/*` proxies to PostHog.

> Re-linking the Vercel project to a different GitHub repo requires the Vercel
> GitHub app to have access to that repo (grant at <https://github.com/apps/vercel>).
