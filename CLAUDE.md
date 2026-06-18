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

## Consumer compatibility (React 18+ and older `@types/react`)

The shipped client packages (`@typecaast/react`, `skin-kit`, `skins`) must install and type-check
cleanly in a wide range of host apps — **including React 18 and old `@types/react`** (e.g. Gatsby 4
pins React 18 + `@types/react@16`). Our own build/typecheck runs on the _newest_ React types, so none
of these surface in-repo — they only appear in a consumer install. Each of these bit us shipping into
such an app; when changing package boundaries or component signatures, sanity-check a fresh install
under React 18 + an old `@types/react`.

- **`react`/`react-dom` are the _only_ peer dependencies; everything else a package imports is a regular
  `dependency` — including `zod`.** zod is internal to the schema (consumers pass plain JSON, never zod
  objects). As a peer it forced the host to provide `zod@^4`, which **conflicted** with apps already on
  `zod@^3` (e.g. via `openai`): pnpm reported `Conflicting peer dependencies: zod` and silently refused
  to upgrade. As a dependency, our `zod@4` installs in isolation and coexists with the host's `zod@3`.
- **No React-19-only APIs in shipped code** — the peer is `react >=18`, so it must run on 18. `use()`
  (reading a lazily-imported skin) is 19-only; on 18 it's `undefined` → `react.use is not a function`.
  Use the universal Suspense primitive instead — a status-tracked promise, thrown while pending (see
  `readBuiltinSkin` in `packages/react/src/builtin-skins.ts`). Same caution for `useOptimistic`,
  `useActionState`, `useFormStatus`.
- **Exported components return `ReactElement`, not `ReactNode`.** Older `@types/react` (16/17) only accept
  `ReactElement | null` as a component return; a `ReactNode` return is rejected with **ts2786**
  ("'X' cannot be used as a JSX component … 'ReactNode' is not a valid JSX element"). Annotate every
  _exported_ component (`Typecaast`, `FitBox`, `TypecaastStage`, `ThemeProvider`, `MessageContent`,
  `TypingDots`, …) as `ReactElement`; keep `ReactNode` only for `children` props and helpers that
  genuinely return strings/null.

## Changing the config schema / step types

The config schema (`packages/schema/src/timeline.ts`, `meta.ts`, …) is the contract between the
**deployed playground** (auto-deploys from source, emits configs in the _latest_ schema) and the
**published npm packages** (what consumers install). Keep them in lockstep:

- **A schema change MUST ship with a changeset _and_ a release.** Change the schema without releasing
  `@typecaast/schema` (+ `@typecaast/core`) and the playground starts emitting configs the installed
  package rejects. This bit us: renaming the `beat` step → `delay` reached the playground but not npm,
  so exported configs failed `configSchema.parse` against the older package. Bump `@typecaast/schema`
  (and `@typecaast/core` if the engine changed); dependents (`react`/`skins`/…) cascade.
- **Adding or changing a timeline step type** touches all of: `packages/schema/src/timeline.ts` (the
  step's Zod schema, the union, and `STEP_TYPES`), `packages/core/src/engine/compile.ts` (the
  `case "<type>"`), every `packages/skins/src/*/capabilities.ts` (the `events.<type>` entry), and in the
  builder — `steps.tsx` (icon, description, group), `format.ts` (`stepLabel`), `store.ts` (`blankStep`
  and the fields `changeStepType` carries), and `StepEditor.tsx` (type-specific fields). Also
  `examples/*.json`, tests, and the `PLAN.md` step list. TypeScript catches the `Record<StepType, …>`
  and exhaustive-switch sites; JSON examples, docs, and the release are on you — run
  `pnpm validate:examples` and the full gate.

## Releases

Changesets + **npm OIDC trusted publishing** (no tokens). Add a changeset (`pnpm changeset`) for any
publishable change; merging the auto "Version Packages" PR triggers `release.yml` (build + `changeset publish`).
**Every publishable `package.json` needs a `repository` field** — npm provenance 422s without it.

## More docs

`CONTRIBUTING.md` (dev setup) · `DEPLOY.md` (hosting/DNS/OIDC) · `ANALYTICS.md` (consent model) ·
`docs/` (authoring/capturing skins, fonts, errors, performance, RSC notes) · `registry/` (community skins).
