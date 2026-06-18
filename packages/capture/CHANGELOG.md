# @typecaast/capture

## 0.0.5

### Patch Changes

- Updated dependencies [36e0f43]
  - @typecaast/skin-kit@0.2.3

## 0.0.4

### Patch Changes

- 9c84658: Move `zod` from `peerDependencies` to `dependencies`. zod is an internal
  implementation detail of Typecaast's schema — consumers pass plain JSON configs
  and never import our zod schemas — so requiring them to provide `zod@^4`
  themselves was wrong. As a peer it broke installs in apps that already depend on
  `zod@^3` (e.g. via `openai`): pnpm reported `Conflicting peer dependencies: zod`
  and silently refused to upgrade. As a regular dependency, our `zod@4` is
  installed in isolation and coexists with the consumer's `zod@3`.
- Updated dependencies [9c84658]
  - @typecaast/skin-kit@0.2.2

## 0.0.3

### Patch Changes

- Updated dependencies [c165c9a]
  - @typecaast/schema@0.2.0
  - @typecaast/core@0.2.0
  - @typecaast/skin-kit@0.2.1

## 0.0.2

### Patch Changes

- Updated dependencies [2c9eb3a]
- Updated dependencies [a857c1e]
- Updated dependencies [b2a8215]
  - @typecaast/skin-kit@0.2.0
  - @typecaast/core@0.1.1

## 0.0.1

### Patch Changes

- Updated dependencies [27bf6bc]
  - @typecaast/schema@0.1.0
  - @typecaast/core@0.1.0
  - @typecaast/skin-kit@0.1.0
