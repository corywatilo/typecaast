# Contributing to Typecaast

Thanks for your interest! This guide covers how to work in the repo and the legal bits.

## Working agreement

- **One step = one focused commit.** The build is tracked in [`BUILD-CHECKLIST.md`](./BUILD-CHECKLIST.md), the source of truth for progress. Build a step → make it pass (types + tests/lint) → check its box **in the same commit**.
- **Conventional commits** referencing the step id, e.g. `feat(core): compile() resolves absolute timeline [M1.3]`.
- Keep the tree **buildable at every commit**. Respect dependency order: `schema → core → renderers → skins → builder → site → capture`.
- A step too big to test on its own is too big — split it.

## Setup

```bash
pnpm install
pnpm build        # turbo task graph
pnpm test         # vitest across packages
pnpm typecheck
pnpm lint
pnpm format       # prettier --write
```

Node 20.11+ (CI runs 22 and 24). pnpm is the package manager (`packageManager` pins the version).

## Changesets

User-facing changes need a changeset:

```bash
pnpm changeset
```

Pick the affected packages and bump level; commit the generated file with your change.

## Licensing of contributions

Typecaast is open-core (see [`LICENSING.md`](./LICENSING.md)). Inbound licensing depends on which package you touch:

- **FSL-licensed packages** (`@typecaast/builder`, `apps/site`): contributions come in under a lightweight **Contributor License Agreement (CLA)**, inbound = outbound. This is required because the source-available, time-converting license needs the project to retain relicensing rights for the eventual Apache-2.0 conversion. A CLA bot will prompt you on your first PR to those packages.
- **Apache-tier packages** (everything else): contributions come in under the **Developer Certificate of Origin (DCO)** — sign off your commits with `git commit -s`.

By contributing, you agree your contribution is licensed under the same tier as the package you're modifying.

## Skins

Anyone can add a platform skin — see the "Build a skin" guide (docs) and the skin submission checklist. Skins must not bundle proprietary marks or fonts and must use correct "-style" naming (see [`TRADEMARKS.md`](./TRADEMARKS.md)). Community/third-party skins are **untrusted code** and are sandboxed at runtime; the registry is a directory, not an endorsement.

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating you agree to uphold it.

## Security

Please report vulnerabilities privately — see [`SECURITY.md`](./SECURITY.md). Do not open public issues for security problems.
