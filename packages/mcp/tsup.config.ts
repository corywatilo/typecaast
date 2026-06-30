import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  banner: { js: "#!/usr/bin/env node" },
  // Inline the authoring docs (.md) as strings so the published server is
  // self-contained — no runtime file reads. registry/skins.json and the own
  // package.json are bundled by esbuild's default JSON loader.
  loader: { ".md": "text" },
  dts: false,
  clean: !options.watch,
  sourcemap: true,
}));
