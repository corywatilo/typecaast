// Ship a package as a React **client module** by guaranteeing the "use client"
// directive at the top of its bundled JS.
//
// Why a post-build step: esbuild (and thus tsup) strips module-level directives
// when it bundles multiple source files into one — it even warns "Module level
// directives cause errors when bundled … was ignored" — and the same happens to
// tsup's `banner` and the preserve-directives plugin. So the only reliable place
// to add it is after the bundle is written. This is the documented remediation,
// not a workaround of our own making.
//
// Imported from each client package's tsup.config and called in `onSuccess`,
// which runs with the package dir as cwd. Idempotent so `--watch` rebuilds don't
// stack directives.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export function prependUseClient(dir = process.cwd()) {
  for (const file of ["dist/index.js", "dist/index.cjs"]) {
    const path = join(dir, file);
    if (!existsSync(path)) continue;
    const code = readFileSync(path, "utf8");
    if (/^["']use client["']/.test(code)) continue;
    writeFileSync(path, '"use client";\n' + code);
  }
}

// Also runnable directly: `node scripts/prepend-use-client.mjs <dir?>`.
if (import.meta.url === `file://${process.argv[1]}`) {
  prependUseClient(process.argv[2] ?? process.cwd());
}
