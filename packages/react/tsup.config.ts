import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react/jsx-runtime", "react-dom"],
}));
