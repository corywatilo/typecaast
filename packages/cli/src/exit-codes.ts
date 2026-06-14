import type { Diagnostic } from "@typecaast/schema";

/**
 * CLI exit codes (PLAN §23). Distinct per error class so callers/CI can branch.
 */
export const EXIT = {
  /** Valid (possibly with warnings). */
  OK: 0,
  /** Unexpected/internal error. */
  ERROR: 1,
  /** Schema or semantic validation error. */
  VALIDATION: 2,
  /** Config version newer than this runtime supports. */
  VERSION: 3,
  /** I/O: file unreadable or not valid JSON. */
  IO: 4,
} as const;

export type ExitCode = (typeof EXIT)[keyof typeof EXIT];

/** Map a single diagnostic code to its exit class. */
function exitForCode(code: string): ExitCode {
  if (code === "E_VERSION") return EXIT.VERSION;
  if (code === "E_IO" || code === "E_JSON") return EXIT.IO;
  return EXIT.VALIDATION;
}

/** The process exit code for a set of diagnostics (first error wins; warnings → OK). */
export function resolveExitCode(diagnostics: Diagnostic[]): ExitCode {
  for (const d of diagnostics) {
    if (d.severity === "error") return exitForCode(d.code);
  }
  return EXIT.OK;
}
