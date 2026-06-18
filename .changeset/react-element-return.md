---
"@typecaast/react": patch
"@typecaast/skin-kit": patch
---

Fix `'Typecaast' cannot be used as a JSX component … 'ReactNode' is not a valid
JSX element` (ts2786) for consumers on older React type packages (e.g.
`@types/react@16`/`@17`, as pinned by Gatsby 4). The exported components were
annotated to return `ReactNode`, which those typings don't accept as a component
return (they require `ReactElement | null`). The public components — `Typecaast`,
`FitBox`, `TypecaastStage`, `ThemeProvider`, `MessageContent`, `TypingDots` — now
return `ReactElement`, which is valid across React 16–19 type versions.
