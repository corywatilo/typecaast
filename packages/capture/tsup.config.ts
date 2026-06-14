import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/import-page.ts", "src/draft.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  // jsdom is only used by the node-only `./import` entry; never bundle it.
  external: ["react", "react/jsx-runtime", "jsdom"],
}));
