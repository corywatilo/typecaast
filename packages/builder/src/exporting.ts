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

/** The npm install line for the packages the embed snippet imports. */
export function installSnippet(): string {
  return `npm install @typecaast/react @typecaast/skins`;
}

/** A React embed snippet for the config. */
export function embedSnippet(config: ConfigInput): string {
  const id = config.meta.skin.id;
  const v = skinVar(id);
  return [
    // `<Typecaast>` is interactive (hooks + theme context), so the embed is a
    // client component. Required in React Server Component frameworks (e.g. the
    // Next.js App Router), harmless elsewhere — and it keeps the skin (which
    // holds component functions) from crossing a server→client prop boundary.
    `"use client";`,
    ``,
    `import { Typecaast } from "@typecaast/react";`,
    `import { ${v} } from "@typecaast/skins";`,
    `import config from "./typecaast.json";`,
    ``,
    `export default function Demo() {`,
    `  return <Typecaast config={config} skin={${v}} autoplay loop />;`,
    `}`,
  ].join("\n");
}

/** A `typecaast render` CLI command for the config. */
export function renderSnippet(config: ConfigInput): string {
  const { width, height } = config.meta.canvas;
  const theme = config.meta.theme === "dark" ? "dark" : "light";
  return `typecaast render typecaast.json --size ${width}x${height} --theme ${theme} --format mp4`;
}
