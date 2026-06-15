# Zero-config skin resolution — refactor checklist

> **Status: DONE.** `<Typecaast config={config} />` resolves the skin from
> `config.meta.skin.id`, lazy-loading only that skin's chunk, and works in a Next
> Server Component with no `"use client"` (verified end-to-end). All boxes below
> are complete.

Goal: `<Typecaast config={config} />` resolves the skin from `config.meta.skin.id`
(single source of truth), loading **only** that skin's chunk (lazy per-skin), with
no `"use client"` required by the consumer. `skin?: Skin` stays as an override for
custom skins.

## 1. Break the `react ↔ skins` build cycle

- [x] Move `TypecaastStage` (+ `ComposerMode`, `TypecaastStageProps`) from
      `@typecaast/react` → `@typecaast/skin-kit` (`stage.tsx`).
- [x] `@typecaast/react` re-exports them (back-compat).
- [x] Update direct importers: builder (`Preview.tsx`?), site, anything else.
- [x] Refactor 7 skins `*.stories.tsx` to import `TypecaastStage` from
      `@typecaast/skin-kit` and drop the `<Typecaast>` (animated) stories.
- [x] Remove `@typecaast/react` from `@typecaast/skins` devDependencies.
- [x] Confirm no orphaned visual baselines / broken visual test.

## 2. Per-skin subpath exports in `@typecaast/skins`

- [x] Add `export default <skin>` to each `src/<skin>/index.ts` (8).
- [x] tsup multi-entry: `src/index.ts` + each `src/<skin>/index.ts`.
- [x] `package.json` `exports`: `./<skin>` → `./dist/<skin>/index.{js,cjs}` + types (8).
- [x] Extend `scripts/prepend-use-client.mjs` to stamp every entry's JS output.

## 3. Lazy resolution in `<Typecaast>`

- [x] `packages/react/src/builtin-skins.ts`: explicit `id → () => import("@typecaast/skins/<id>")` map (static strings → per-skin chunks).
- [x] `skin` prop becomes optional; when omitted, `use(loadBuiltinSkin(id))` inside a `<Suspense>` with a sized placeholder; cached promises.
- [x] Clear synchronous error for an unknown id (with the "pass `skin` for custom" hint).
- [x] `@typecaast/react` depends on `@typecaast/skins`.

## 4. Builder / exports / docs

- [x] `embedSnippet` → `<Typecaast config={config} autoplay loop />` (no skin import, no `"use client"`).
- [x] `installSnippet` → `npm install @typecaast/react`.
- [x] README + on-site docs quickstart → zero-config form.
- [x] `exporting.test.ts` updated.

## 5. Verify

- [x] typecheck / test / lint / build green.
- [x] Real Next Server Component: no `"use client"`, no hydration error, only the used skin's chunk loads, no jarring flash.
- [x] Changeset (minor: new public API).
