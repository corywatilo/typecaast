# Error taxonomy & exit codes

Typecaast validation produces structured **diagnostics**; the CLI maps them to
**exit codes** so scripts and CI can branch on the error class (PLAN §23).

## CLI exit codes

Defined in `@typecaast/cli` (`src/exit-codes.ts`):

| Code | Name         | Meaning                                               |
| ---- | ------------ | ----------------------------------------------------- |
| `0`  | `OK`         | Valid (warnings allowed).                             |
| `1`  | `ERROR`      | Unexpected/internal error.                            |
| `2`  | `VALIDATION` | Schema or semantic validation error.                  |
| `3`  | `VERSION`    | Config `version` is newer than this runtime supports. |
| `4`  | `IO`         | File unreadable, or not valid JSON.                   |

First error wins; warnings alone still exit `0`.

## Diagnostics

Every diagnostic has `{ code, severity, message, location?, hint? }`
(`severity` is `error` or `warning`). `validateConfig(raw)` from
`@typecaast/schema` returns them; the CLI prints them and derives the exit code.

### Errors

| Code                | Exit | Cause                                                         |
| ------------------- | ---- | ------------------------------------------------------------- |
| `E_IO`              | 4    | File can't be read. _(CLI-level.)_                            |
| `E_JSON`            | 4    | File isn't valid JSON. _(CLI-level.)_                         |
| `E_VERSION`         | 3    | `version` exceeds the supported config version.               |
| `E_SCHEMA`          | 2    | A Zod schema violation (`location` points at the field path). |
| `E_DUP_PARTICIPANT` | 2    | Two participants share an `id`.                               |
| `E_REF_PARTICIPANT` | 2    | A step's `from`/`target` references an unknown participant.   |

### Warnings (exit `0`)

| Code        | Cause                                                               |
| ----------- | ------------------------------------------------------------------- |
| `W_NO_SELF` | No participant is marked `isSelf` — the composer side is ambiguous. |
| `W_NO_PREV` | A `$prev` target has no preceding message to bind to.               |
| `W_TARGET`  | A reaction/edit/delete `target` id doesn't resolve.                 |

## Consuming diagnostics

```bash
typecaast validate config.json --json   # machine-readable {file, exitCode, diagnostics}
```

Programmatically, `validateConfig` is the single source of truth — the builder,
CLI, and docs all run the same checks, so a config that validates in one
validates everywhere.
