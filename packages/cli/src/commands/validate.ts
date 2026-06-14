import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateConfig, type Diagnostic } from "@typecaast/schema";
import { EXIT, resolveExitCode, type ExitCode } from "../exit-codes.js";
import { formatDiagnostic, summarize } from "../format.js";

export interface ValidateOptions {
  json?: boolean;
}

/** Diagnose a config file without printing — testable core of `validate`. */
export function diagnoseFile(file: string): Diagnostic[] {
  const path = resolve(process.cwd(), file);
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return [
      {
        code: "E_IO",
        severity: "error",
        message: `Cannot read file: ${file}`,
        location: file,
        hint: "Check the path exists and is readable.",
      },
    ];
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    return [
      {
        code: "E_JSON",
        severity: "error",
        message: `Invalid JSON: ${(error as Error).message}`,
        location: file,
        hint: "Fix the JSON syntax.",
      },
    ];
  }
  return validateConfig(raw);
}

/** Run `validate <file>`, print results, and return the process exit code. */
export function runValidate(file: string, options: ValidateOptions): ExitCode {
  const diagnostics = diagnoseFile(file);
  const exitCode = resolveExitCode(diagnostics);

  if (options.json) {
    process.stdout.write(
      JSON.stringify({ file, exitCode, diagnostics }, null, 2) + "\n",
    );
    return exitCode;
  }

  for (const d of diagnostics) {
    const line = formatDiagnostic(d);
    if (d.severity === "error") process.stderr.write(line + "\n");
    else process.stdout.write(line + "\n");
  }

  if (exitCode === EXIT.OK) {
    process.stdout.write(`✓ ${file} — ${summarize(diagnostics)}\n`);
  } else {
    process.stderr.write(`✖ ${file} — ${summarize(diagnostics)}\n`);
  }
  return exitCode;
}
