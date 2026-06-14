// Assert registry/skins.json stays in sync with the built-in skins.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { builtinSkins } from "../packages/skins/dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const registry = JSON.parse(
  readFileSync(join(here, "..", "registry", "skins.json"), "utf8"),
);

const builtinIds = new Set(Object.keys(builtinSkins));
const officialIds = new Set(
  registry.skins.filter((s) => s.official).map((s) => s.id),
);

const errors = [];
for (const id of builtinIds) {
  if (!officialIds.has(id))
    errors.push(`built-in skin "${id}" is missing from registry/skins.json`);
}
for (const id of officialIds) {
  if (!builtinIds.has(id))
    errors.push(`registry official skin "${id}" is not a built-in skin`);
}

if (errors.length) {
  console.error("✖ registry out of sync:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(`✓ registry in sync (${builtinIds.size} official skins)`);
