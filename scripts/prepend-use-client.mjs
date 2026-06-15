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
// Stamps every emitted JS/CJS file under dist/ (entry points and shared chunks),
// so multi-entry packages (per-skin subpaths) are all covered. Imported from each
// client package's tsup.config and called in `onSuccess` (cwd = package dir).
// Idempotent so `--watch` rebuilds don't stack directives.
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIRECTIVE = '"use client";\n';

function stamp(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      stamp(path);
    } else if (/\.(js|cjs|mjs)$/.test(entry.name)) {
      const code = readFileSync(path, "utf8");
      if (/^["']use client["']/.test(code)) continue;
      writeFileSync(path, DIRECTIVE + code);
    }
  }
}

export function prependUseClient(dir = process.cwd()) {
  stamp(join(dir, "dist"));
}

// Also runnable directly: `node scripts/prepend-use-client.mjs <dir?>`.
if (import.meta.url === `file://${process.argv[1]}`) {
  prependUseClient(process.argv[2] ?? process.cwd());
}
