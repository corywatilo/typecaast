import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: true,
  sourcemap: true,
  treeshake: true,
  onSuccess: "node scripts/gen-json-schema.mjs",
}));
