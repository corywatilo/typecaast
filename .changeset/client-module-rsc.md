---
"@typecaast/react": patch
"@typecaast/skin-kit": patch
"@typecaast/skins": patch
---

Ship these packages as React **client modules** (a `"use client"` directive at
the top of the built output). They use hooks and theme context (`createContext`
at module scope), so loading them in a React Server Component graph (e.g. the
Next.js App Router) previously crashed with `createContext is not a function`.
The directive is added post-bundle because esbuild strips in-source/banner
directives when bundling.
