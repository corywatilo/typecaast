---
"@typecaast/react": patch
---

Fix `(0, react.use) is not a function` on React 18. The zero-config skin path
(no `skin` prop) resolved the lazily-imported skin with React 19's `use()` hook,
which doesn't exist on React 18 — so `<Typecaast>` crashed in React 18 apps
(e.g. Gatsby) even though the package advertises `react >=18`. It now suspends
via the universal throw-the-promise Suspense primitive, which behaves
identically on React 18 and 19.
