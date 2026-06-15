# Embedding `<Typecaast>` in React Server Component frameworks — decision digest

> **Update:** the "Open question" below was answered — we _did_ build zero-config
> resolution, but cleanly: the renderer depends on `@typecaast/skins` only after
> breaking the cycle (moved `TypecaastStage` to `skin-kit`, decoupled the
> stories), and it **lazy-loads one skin by id** via per-skin subpath exports
> rather than bundling all of them. See `docs/notes/zero-config-refactor.md`.
> `<Typecaast config={config} />` now works in a Server Component with no
> `"use client"`. The analysis below is kept as the original rationale.

Context for a second opinion. Short version: the reported crash is fixed two
ways (a client-directive on the published packages + a `"use client"` embed),
and I **rejected** the "resolve skins by id inside the renderer" idea because it
inverts the dependency graph and forces a build cycle. Sanity-check that call.

## The bug (reported)

Pasting the exported embed into a Next.js **App Router** page (`app/(legal)/terms/page.tsx`,
a Server Component by default) threw:

```
Runtime TypeError: (0 , react__WEBPACK_IMPORTED_MODULE_0__.createContext) is not a function
  rsc)/./app/(legal)/terms/page.tsx
```

## Root cause

- `@typecaast/skin-kit/src/theme.tsx` calls `createContext(...)` **at module
  scope** (line 10).
- None of our client packages shipped a `"use client"` boundary.
- So when a Server Component imports `@typecaast/react`, the package (which
  bundles/imports skin-kit) is evaluated in the **RSC server graph**, where
  `createContext` doesn't exist → crash at import.

Two distinct RSC constraints are in play:

1. **Client-only module loaded server-side** → `createContext` crash.
2. **Non-serializable props across the server→client boundary** → a `Skin`
   object holds component _functions_, which can't be passed from a Server
   Component to a Client Component even once #1 is solved.

## What shipped (the fix)

### 1. Publish the client packages as real client modules

`@typecaast/react`, `@typecaast/skin-kit`, `@typecaast/skins` now carry a
`"use client"` directive at the top of their **built** output.

Implementation note (the part worth reviewing): esbuild **strips module-level
directives when bundling** (it even warns `Module level directives cause errors
when bundled … was ignored`). So none of these worked:

- `"use client"` in `src/index.ts` → stripped on bundle.
- tsup `banner: { js: '"use client";' }` → stripped the same way.
- `esbuild-plugin-preserve-directives` → still stripped in this tsup@8.5 + esbuild setup.

The reliable fix is a **post-bundle prepend** in tsup `onSuccess`
(`scripts/prepend-use-client.mjs`, idempotent), which writes the directive to
`dist/index.{js,cjs}` after esbuild is done. This is the documented remediation
for the esbuild limitation, not a bespoke hack. Verified: the directive is at
line 1 of every published ESM + CJS bundle.

### 2. Embed snippet leads with `"use client"`

The builder's exported snippet (and the README/docs quickstarts) start with
`"use client";`. This is idiomatic for an interactive component (Recharts,
Framer Motion, etc. all require it) and sidesteps constraint #2: the whole embed
runs client-side, so the `Skin` object never crosses a boundary.

```tsx
"use client";
import { Typecaast } from "@typecaast/react";
import { telegram } from "@typecaast/skins";
import config from "./typecaast.json";
export default () => (
  <Typecaast config={config} skin={telegram} autoplay loop />
);
```

## The idea I rejected: resolve skins by id inside `<Typecaast>`

The tempting "zero-config" API: `<Typecaast config={config} />` in a Server
Component, no `"use client"`, skin resolved from `config.meta.skin.id`. For that,
`@typecaast/react` would import the built-in registry from `@typecaast/skins`.

Why I rejected it:

1. **Inverted coupling.** The renderer would depend on the concrete presets.
   Today the arrow points the right way: skins depend on the contract
   (`skin-kit`), not the renderer. `react → skins` is backwards.
2. **Build cycle.** `@typecaast/skins` devDepends on `@typecaast/react` (its 7
   Storybook stories use `<Typecaast>`/`<TypecaastStage>`). Adding `react → skins`
   makes turbo hard-fail: `Cyclic dependency detected`. Breaking it means moving
   `TypecaastStage` into `skin-kit` and gutting/relocating the stories.
3. **Bundle bloat.** `builtinSkins` references all 8 skins, so importing it pulls
   **every** skin into **every** `@typecaast/react` consumer (~30KB gz), killing
   tree-shaking even for people who pass one explicit skin.
4. **Marginal benefit.** It only removes a one-line `"use client"` that's the
   idiomatic, expected pattern for interactive components anyway.

A registry in `skin-kit` with self-registering skins avoids the cycle but needs
the user to import the skins package for a side-effect (defeated by
`sideEffects: false`) and still isn't truly zero-config — no better than passing
the object.

## Open question for the reviewer

Do you agree that **client-module packaging + an idiomatic `"use client"` embed**
is the right call, and that coupling the renderer to all concrete skins to save
one directive is the wrong trade? If zero-config server-component embedding is
considered worth it, the cleanest path I can see is: move `TypecaastStage` to
`@typecaast/skin-kit`, drop `@typecaast/react` from skins' devDeps (refactor the
stories to render via `skin-kit` + the `core` engine), then let `react` depend on
`skins` and add per-skin subpath exports (`@typecaast/skins/telegram`) so the
by-id path can lazy-resolve without bundling all presets. That's a real refactor;
I didn't want to do it unilaterally.
