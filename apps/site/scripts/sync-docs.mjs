// Copy the on-site authoring guides from the repo's /docs into the site's
// content/ dir so the App Router can render them. Source of truth stays /docs;
// content/ is generated and gitignored. Runs before `next dev` / `next build`.
// Keep DOCS in sync with SITE_DOCS in app/docs/_docs.ts.
import { mkdirSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // apps/site/scripts
const siteRoot = join(here, ".."); // apps/site
const srcDir = join(siteRoot, "..", "..", "docs"); // repo /docs
const outDir = join(siteRoot, "content", "docs");

const DOCS = ["authoring-configs", "pacing", "message-content"];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
for (const slug of DOCS) {
  copyFileSync(join(srcDir, `${slug}.md`), join(outDir, `${slug}.md`));
}
console.log(`✓ synced ${DOCS.length} docs → apps/site/content/docs`);
