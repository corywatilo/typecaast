# CLAUDE.md

Guidance for AI agents working in this repo. Keep it short and current; update it when conventions change.

## What this is

**Typecaast** — simulate & record chat conversations in pixel-faithful renderings of real chat UIs
(Slack, iMessage, Telegram, …) from one JSON config, rendered as a React `<Typecaast>` component
**and** as Remotion video. Open-core: the runtime is Apache-2.0, the builder/design-system are FSL.
Live at https://typecaast.com.

`PLAN.md` is the design spec; `BUILD-CHECKLIST.md` is the canonical "where are we". Read those for depth.

## Layout (pnpm workspaces + Turborepo)

Dependency order — **schema → core → {react, remotion, skin-kit} → skins → builder → site → capture**:

- `packages/schema` — Zod config schema + `STEP_TYPES` + `validateConfig`. **No DOM/Node-only APIs.**
- `packages/core` — pure engine: `compile(config)` → timeline, `getStateAt(t)` sampler, seeded RNG.
  Deterministic — **no `Date.now()`/`Math.random()`**; same `(config, t)` ⇒ deep-equal state. No DOM/Node-only APIs.
- `packages/skin-kit` — the `Skin` contract, theme context, `TypecaastStage` (SimState → skin components).
- `packages/skins` — the built-in skins (one folder each). `getSkin`/`builtinSkins` registry.
- `packages/react` — `<Typecaast>` + `useTypecaast`. `packages/remotion` — video composition + `renderVideo`.
- `packages/cli` — `typecaast validate|render`. `packages/capture` — capture a live UI → a skin draft.
- `packages/builder` (FSL) + `packages/ui` (FSL) — the visual editor + design system. `apps/site` — the website/playground.

## Commands

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm format` (write) / `pnpm format:check`.
Filter a package: `pnpm --filter @typecaast/<pkg> run <script>`.

**Before committing, run the full gate locally** (CI runs exactly these and will block on any):
`pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build && pnpm validate:examples && pnpm check:registry && pnpm check:no-telemetry`.
`pnpm typecheck` is workspace-wide — a per-package `vitest` run will miss cross-package type errors.

## Working agreement

- **Commit-by-commit**: one focused change per commit; keep the tree green (gates pass) every commit.
- Conventional commits (`feat(builder): …`, `fix(core): …`). End every commit message with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Commits go to `master` (direct commits allowed; force-push/deletion blocked). The site auto-deploys on push.
- **Contract-first, UI-on-mocks, then engine** — design the data contract, build UI against mocks, wire the engine last.
- Don't commit/push unless asked, **except** when this repo's standing agreement (recorded in agent memory) says to.

## Non-obvious rules (these have bitten us)

- **Client packages ship a `"use client"` directive added _post-bundle_.** `@typecaast/react`, `skin-kit`,
  `skins` are React client modules, but esbuild strips in-source/banner directives when bundling — so
  `scripts/prepend-use-client.mjs` (tsup `onSuccess`) re-adds it to the built output. Don't add a source
  directive or tsup `banner` expecting it to survive; don't remove the onSuccess step.
- **Skins resolve lazily by id.** `<Typecaast config={config} />` reads `config.meta.skin.id` and lazy-imports
  that one skin via a per-skin subpath (`@typecaast/skins/<id>`). Adding a built-in skin touches several
  places: a folder under `packages/skins/src/<id>/` with a default export, the `packages/skins/src/registry.ts`
  registry, a `./<id>` entry in the skins `package.json` `exports`, a `BUILTIN_SKIN_LOADERS` line in
  `packages/react/src/builtin-skins.ts`, a row in `registry/skins.json` (CI `check:registry`), and builder
  `steps.tsx` for the timeline icon. The `/create-skin` skill automates most of this.
- `<Typecaast>` **normalizes the config at runtime** (`configSchema.parse`) and accepts a raw/imported JSON —
  never require a pre-parsed `Config` at the prop boundary.
- **The builder is client-only** (mounted `ssr:false` in the site). Builder-local tooltips use `position:fixed`
  (`packages/builder/src/Tooltip.tsx`) to escape clipping `overflow:auto` columns. `@typecaast/ui`'s `InfoTip`
  stays **CSS-only / SSR-safe** — don't make it stateful (it's imported into server components elsewhere).
- **No telemetry in shipped runtime packages** — enforced by `pnpm check:no-telemetry`. Analytics live only in `apps/site`.
- `apps/site` and the builder render via the **built `dist`** of the workspace packages, so rebuild
  (`pnpm build` or the package's `dev` watch) after changing a package before checking the site.

## Releases

Changesets + **npm OIDC trusted publishing** (no tokens). Add a changeset (`pnpm changeset`) for any
publishable change; merging the auto "Version Packages" PR triggers `release.yml` (build + `changeset publish`).
**Every publishable `package.json` needs a `repository` field** — npm provenance 422s without it.

## More docs

`CONTRIBUTING.md` (dev setup) · `DEPLOY.md` (hosting/DNS/OIDC) · `ANALYTICS.md` (consent model) ·
`docs/` (authoring/capturing skins, fonts, errors, performance, RSC notes) · `registry/` (community skins).
