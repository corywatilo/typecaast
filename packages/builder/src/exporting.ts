import type { ConfigInput } from "@typecaast/schema";

/** kebab-case skin id → camelCase export name (e.g. messages-macos → messagesMacos). */
export function skinVar(id: string): string {
  const words = id.split("-").filter(Boolean);
  return (
    (words[0] ?? "skin") +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
  );
}

export function toJSON(config: ConfigInput): string {
  return JSON.stringify(config, null, 2) + "\n";
}

export type PackageManager = "npm" | "yarn" | "pnpm";

const INSTALL_CMD: Record<PackageManager, string> = {
  npm: "npm install",
  yarn: "yarn add",
  pnpm: "pnpm add",
};

/** The install line for the packages the embed snippet imports. */
export function installSnippet(pm: PackageManager = "npm"): string {
  // `@typecaast/skins` comes along as a dependency of `@typecaast/react` (the
  // skin is lazy-loaded by id), so the embed only needs the one package.
  return `${INSTALL_CMD[pm]} @typecaast/react`;
}

/**
 * A React embed snippet for the config. Zero-config: the skin is taken from
 * `config.meta.skin.id` and lazy-loaded by `<Typecaast>`, so only the
 * serializable `config` is passed — the embed drops straight into a React Server
 * Component (Next.js App Router) with no skin import and no `"use client"`.
 */
export function embedSnippet(
  _config: ConfigInput,
  opts: { isolate?: boolean } = {},
): string {
  const lines: string[] = [];
  // `isolate` renders in a shadow root (attachShadow) → client-only, so the file
  // must be a client component in the App Router.
  if (opts.isolate) lines.push(`"use client";`, ``);
  lines.push(
    `import { Typecaast } from "@typecaast/react";`,
    `import config from "./typecaast.json";`,
    ``,
    `export default function Demo() {`,
    `  return <Typecaast config={config} autoplay${opts.isolate ? " isolate" : ""} />;`,
    `}`,
  );
  return lines.join("\n");
}

/** A `typecaast render` CLI command for the config. */
export function renderSnippet(config: ConfigInput): string {
  const { width, height } = config.meta.canvas;
  const theme = config.meta.theme === "dark" ? "dark" : "light";
  return `typecaast render typecaast.json --size ${width}x${height} --theme ${theme} --format mp4`;
}
