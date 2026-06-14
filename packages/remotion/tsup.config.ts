import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts", "src/render.ts", "src/render-root.tsx"],
  format: ["esm"],
  dts: !options.watch,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react/jsx-runtime", "react-dom", "remotion"],
}));
