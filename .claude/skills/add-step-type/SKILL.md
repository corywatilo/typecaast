---
name: add-step-type
description: Add or change a Typecaast timeline step type end-to-end. Use when the user wants a new kind of timeline event (e.g. "add a 'poll' step", "support pinned messages", "add a 'voice-note' step type") or to rename/reshape an existing one. Walks every touchpoint — schema, engine, every skin's capabilities, the builder UI, examples, tests — and the mandatory changeset + release so the playground and npm stay in lockstep.
---

# Add (or change) a timeline step type

A **step type** is one entry in the discriminated union that makes up a config's
`timeline[]`. Adding one is deliberately cross-cutting: the type flows from the
Zod schema through the engine, into every skin, and across the whole builder UI.
Miss a touchpoint and you get either a TS error (good — those are caught) or a
silently-dropped step at render time (bad). Work top-down in dependency order so
each layer compiles against the one below it.

**Read first:** the "Changing the config schema / step types" section of the root
`CLAUDE.md` — this skill is the executable version of that checklist.

## The non-negotiable rule

**A step-type change MUST ship with a changeset _and_ a release.** The deployed
playground auto-deploys from source and emits configs in the _latest_ schema;
consumers install the _published_ `@typecaast/schema`. Change the schema without
releasing it and the playground starts emitting configs the installed package
rejects (`No matching discriminator`). This has bitten us. Plan the changeset in
step 8 as part of the work, not after.

## Steps

1. **Schema** — `packages/schema/src/timeline.ts`.
   - Add a `z.object({ type: z.literal("<type>"), …fields, ...stepBaseShape })`
     schema (the base shape is just `{ id, instant }`; everything else is the
     step's own fields). Keep `from`/`target`/`text`/`emoji` names consistent
     with sibling steps so the builder's `changeStepType` can carry them over.
   - Add it to the discriminated union **and** to the `STEP_TYPES` array
     (order = builder picker order within a group).
   - If a `from` participant or a `target` step id is required, validate it the
     same way the neighbouring steps do.

2. **Engine** — `packages/core/src/engine/compile.ts`. Add the
   `case "<type>":` to the compile switch — emit the timeline event(s) it
   produces (and any duration it consumes). The switch is exhaustive over
   `StepType`, so TypeScript flags this if you forget. Keep it **deterministic**
   (no `Date.now()`/`Math.random()` — use the seeded RNG).

3. **Capabilities** — every `packages/skins/src/*/capabilities.ts`. Add the
   `events.<type>` entry (`"native" | "fallback" | "unsupported"`) for **each**
   skin. The `Record<StepType, …>` type makes a miss a compile error. Be honest:
   `unsupported` means the skin drops it (the builder warns the user); use
   `fallback` only if the skin renders something sensible generically.

4. **Builder — metadata & picker** — `packages/builder/src/steps.tsx`. Add a
   `STEP_META` entry (one-line "when to use" `description` + which `group`), and
   an icon in the `ICONS` record (16px stroke SVG, `currentColor`). Slot the
   type into the right `STEP_GROUPS` bucket.

5. **Builder — label, store, editor**:
   - `format.ts` → extend `stepLabel` so the row's second line previews the new
     step readably.
   - `store.ts` → add the type to `blankStep` (sane defaults so it validates),
     and make sure `changeStepType` carries the fields you want preserved when
     switching to/from it.
   - `StepEditor.tsx` → add the type-specific form fields.

6. **Examples & docs** — add or extend an `examples/*.json` that exercises the
   step (so `pnpm validate:examples` covers it), and update the step list in
   `PLAN.md`.

7. **Tests** — `blankStep` is exercised for every type in
   `packages/builder/src/store.test.ts` (the "valid steps for every type" loop) —
   add the new type there. Add engine coverage in `packages/core` for the new
   `case`. Cover any new validation.

8. **Changeset + release** — `pnpm changeset`: **minor** for `@typecaast/schema`
   and (if the engine changed) `@typecaast/core`; dependents cascade. Write the
   migration note in the changeset body if you renamed/reshaped an existing type.
   This is what keeps the playground and npm in lockstep — don't skip it.

## Verify

Run the **full gate** (a per-package run misses cross-package type errors):

```
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build \
  && pnpm validate:examples && pnpm check:registry && pnpm check:no-telemetry
```

TypeScript catches the `Record<StepType, …>` and exhaustive-switch sites for
free; the JSON examples, the docs, and the release are on you. Then sanity-check
the step in the playground (`pnpm dev`): the **+ Step picker** lists it under the
right group with its icon and description, picking it inserts a valid step, the
editor shows its fields, and the timeline row previews it. Switch skins to
confirm the capability flag drives the "Won't render in this skin" warning
correctly.

## Renaming or reshaping an existing type

Same touchpoints, plus: migrate `examples/*.json`, write the migration in the
changeset body, and remember the playground emits the **new** shape the moment it
deploys — so the release must land for existing embeds to keep validating. (The
`beat` → `delay` rename is the cautionary tale: shipped to the playground, not to
npm, and exported configs broke against the installed package.)
