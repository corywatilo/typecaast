import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { skinFiles, toNames } from "./templates.js";

function main(): void {
  const input = process.argv[2];
  if (!input || input === "--help" || input === "-h") {
    process.stdout.write(
      "Usage: create-typecaast-skin <name>\n" +
        "  e.g. create-typecaast-skin signal\n" +
        "Scaffolds a Typecaast skin in ./<id>/.\n",
    );
    process.exit(input ? 0 : 1);
  }

  const names = toNames(input);
  const dir = resolve(process.cwd(), names.id);
  if (existsSync(dir)) {
    process.stderr.write(`✖ Directory already exists: ${names.id}\n`);
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });
  const files = skinFiles(input);
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(dir, name), contents);
  }

  process.stdout.write(
    `✓ Scaffolded the "${names.name}" skin in ${names.id}/\n\n` +
      `  ${Object.keys(files)
        .map((f) => `${names.id}/${f}`)
        .join("\n  ")}\n\n` +
      `Next: install peers and make it yours —\n` +
      `  pnpm add @typecaast/skin-kit @typecaast/core react zod\n` +
      `  open ${names.id}/README.md\n`,
  );
}

main();
