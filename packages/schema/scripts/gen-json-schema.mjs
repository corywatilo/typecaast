// Regenerate the committed JSON Schema artifact from the built schema.
// Run after build (tsup `onSuccess`) or via `pnpm gen:schema`.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { configJsonSchema } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "typecaast.schema.json");

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://typecaast.com/schema/v1/typecaast.schema.json",
  title: "Typecaast config",
  ...configJsonSchema(),
};

writeFileSync(out, JSON.stringify(schema, null, 2) + "\n");
console.log(`✓ wrote ${out}`);
