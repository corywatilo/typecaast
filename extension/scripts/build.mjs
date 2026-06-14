// Bundle the MV3 extension. The picker is a classic content script (IIFE,
// injected via chrome.scripting); the worker and popup are ESM. Then copy the
// manifest + popup shell into dist/ so the folder loads unpacked as-is.
import { build } from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });

const common = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "chrome110",
  logLevel: "info",
};

await build({
  ...common,
  entryPoints: [join(root, "src/picker.ts")],
  outfile: join(dist, "picker.js"),
  format: "iife",
});

await build({
  ...common,
  entryPoints: [join(root, "src/background.ts")],
  outfile: join(dist, "background.js"),
  format: "esm",
});

await build({
  ...common,
  entryPoints: [join(root, "src/popup.ts")],
  outfile: join(dist, "popup.js"),
  format: "esm",
});

copyFileSync(join(root, "manifest.json"), join(dist, "manifest.json"));
copyFileSync(join(root, "popup.html"), join(dist, "popup.html"));

console.log("✓ extension bundled → dist/ (load unpacked)");
