import type { Diagnostic, Severity } from "@typecaast/schema";

const SYMBOL: Record<Severity, string> = {
  error: "✖",
  warning: "⚠",
  info: "ℹ",
};

/** Format one diagnostic into one or two terminal lines. */
export function formatDiagnostic(d: Diagnostic): string {
  const where = d.location ? `  ${d.location}` : "";
  const head = `${SYMBOL[d.severity]} ${d.code}${where} — ${d.message}`;
  return d.hint ? `${head}\n    hint: ${d.hint}` : head;
}

/** A one-line summary, e.g. `2 errors, 1 warning`. */
export function summarize(diagnostics: Diagnostic[]): string {
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (errors === 0 && warnings === 0) return "valid";
  return [plural(errors, "error"), plural(warnings, "warning")].join(", ");
}
