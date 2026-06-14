import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { skinDraftSchema } from "@typecaast/capture/draft";
import { EXIT, type ExitCode } from "../exit-codes.js";
import { scaffoldSkinFiles, toNames } from "../scaffold.js";

export interface ScaffoldOptions {
  out?: string;
  name?: string;
}

/** Run `scaffold-skin <draft.json>`, write the package, return the exit code. */
export function runScaffoldSkin(
  draftFile: string,
  options: ScaffoldOptions,
): ExitCode {
  const draftPath = resolve(process.cwd(), draftFile);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(draftPath, "utf8"));
  } catch (error) {
    process.stderr.write(`✖ Cannot read draft: ${(error as Error).message}\n`);
    return EXIT.IO;
  }

  const parsed = skinDraftSchema.safeParse(raw);
  if (!parsed.success) {
    process.stderr.write(`✖ ${draftFile} is not a valid SkinDraft:\n`);
    for (const issue of parsed.error.issues.slice(0, 8)) {
      process.stderr.write(`  ${issue.path.join(".")}: ${issue.message}\n`);
    }
    return EXIT.VALIDATION;
  }

  const draft = parsed.data;
  const names = toNames(options.name ?? "", draft.meta.name);
  const outDir = resolve(process.cwd(), options.out ?? join("skins", names.id));

  const files = scaffoldSkinFiles(draft, options.name ?? "");
  for (const [rel, content] of Object.entries(files)) {
    const target = join(outDir, rel);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
  }

  process.stdout.write(
    `✓ Scaffolded "${names.name}" → ${outDir}\n` +
      `  Next: open ${join(outDir, "README.md")} and confirm the slots.\n`,
  );
  return EXIT.OK;
}
