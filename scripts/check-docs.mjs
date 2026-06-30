// Assert the authoring docs stay in sync with the live schema, so they can't
// silently drift as the product evolves. Mirrors check-registry.mjs: it imports
// the BUILT schema (not a hardcoded list) and asserts the docs name every step
// type, every pacing field, and every built-in skin id. Add a step type or a
// pacing field without documenting it and this fails — same teeth as the
// registry/telemetry guards. (See CLAUDE.md "Changing the config schema".)
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STEP_TYPES, pacingSchema } from "../packages/schema/dist/index.js";
import { builtinSkins } from "../packages/skins/dist/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

const AUTHORING = "docs/authoring-configs.md";
const PACING = "docs/pacing.md";
// Docs the authoring guide links to — a rename here would dangle those pointers.
const REQUIRED = [AUTHORING, PACING, "docs/message-content.md"];

const errors = [];

for (const rel of REQUIRED) {
  if (!existsSync(join(root, rel))) errors.push(`missing doc: ${rel}`);
}

if (!errors.length) {
  const authoring = read(AUTHORING);
  const pacing = read(PACING);

  // Require each token as a backtick-wrapped code span so a passing match is a
  // deliberate mention, not an accidental prose collision.
  for (const step of STEP_TYPES) {
    if (!authoring.includes(`\`${step}\``))
      errors.push(`step type "${step}" is not documented in ${AUTHORING}`);
  }
  for (const key of Object.keys(pacingSchema.shape)) {
    if (!pacing.includes(`\`${key}\``))
      errors.push(`pacing field "${key}" is not documented in ${PACING}`);
  }
  for (const id of Object.keys(builtinSkins)) {
    if (!authoring.includes(`\`${id}\``))
      errors.push(`built-in skin "${id}" is not listed in ${AUTHORING}`);
  }
}

if (errors.length) {
  console.error("✖ authoring docs out of sync:\n  " + errors.join("\n  "));
  process.exit(1);
}
console.log(
  `✓ docs cover ${STEP_TYPES.length} step types, ` +
    `${Object.keys(pacingSchema.shape).length} pacing fields, ` +
    `${Object.keys(builtinSkins).length} skins`,
);
