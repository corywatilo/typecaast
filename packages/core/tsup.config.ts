import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/mocks/index.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
}));
