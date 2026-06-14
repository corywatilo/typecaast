import { readFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { validateConfig } from "@typecaast/schema";
import { EXIT, type ExitCode } from "../exit-codes.js";
import { formatDiagnostic } from "../format.js";

export interface RenderOptions {
  out?: string;
  format?: string;
  size?: string;
  aspect?: string;
  scale?: number | string;
  theme?: string;
  transparent?: boolean;
}

const EXT: Record<string, string> = { mp4: ".mp4", gif: ".gif", webm: ".webm" };

/** Run `render <config>`: validate, then export to a video file. */
export async function runRender(
  file: string,
  options: RenderOptions,
): Promise<ExitCode> {
  const path = resolve(process.cwd(), file);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    process.stderr.write(`✖ E_IO  ${file} — ${(error as Error).message}\n`);
    return EXIT.IO;
  }

  const diagnostics = validateConfig(raw);
  for (const d of diagnostics) process.stderr.write(formatDiagnostic(d) + "\n");
  if (diagnostics.some((d) => d.severity === "error")) return EXIT.VALIDATION;

  const format = (options.format ?? "mp4").toLowerCase();
  if (!(format in EXT)) {
    process.stderr.write(`✖ --format must be mp4 | gif | webm\n`);
    return EXIT.ERROR;
  }
  const out =
    options.out ??
    join(dirname(path), basename(file, extname(file)) + EXT[format]);

  let width: number | undefined;
  let height: number | undefined;
  if (options.size) {
    const m = /^(\d+)x(\d+)$/.exec(options.size);
    if (!m) {
      process.stderr.write(`✖ --size must be WxH, e.g. 1080x1920\n`);
      return EXIT.ERROR;
    }
    width = Number(m[1]);
    height = Number(m[2]);
  }

  const scale = options.scale ? Number(options.scale) : 1;
  const theme = options.theme === "dark" ? "dark" : "light";

  // Lazy import: the heavy renderer only loads for `render`, not `validate`.
  const { renderVideo } = await import("@typecaast/remotion/render");

  process.stdout.write(
    `Rendering ${file} → ${out} (${format}${scale !== 1 ? `, ${scale}x` : ""}, ${theme})\n`,
  );
  let lastPct = -1;
  try {
    await renderVideo({
      config: raw as Parameters<typeof renderVideo>[0]["config"],
      outPath: out,
      format: format as "mp4" | "gif" | "webm",
      theme,
      width,
      height,
      aspect: options.aspect as never,
      scale,
      transparent: options.transparent,
      onProgress: (p) => {
        const pct = Math.floor(p * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          process.stdout.write(`\r  ${pct}%   `);
        }
      },
    });
  } catch (error) {
    process.stderr.write(`\n✖ Render failed: ${(error as Error).message}\n`);
    return EXIT.ERROR;
  }

  process.stdout.write(`\r✓ wrote ${out}      \n`);
  return EXIT.OK;
}
