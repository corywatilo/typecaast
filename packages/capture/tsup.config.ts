import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/import-page.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // jsdom is only used by the node-only `./import` entry; never bundle it.
  external: ["react", "react/jsx-runtime", "jsdom"],
});
