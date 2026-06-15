import { prependUseClient } from "../../scripts/prepend-use-client.mjs";
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react/jsx-runtime", "react-dom"],
  // `<Typecaast>` uses hooks + theme context, so the package is a React client
  // module. esbuild strips in-source/banner "use client" when bundling, so we
  // re-add it after the bundle — lets the package load in RSC trees untouched.
  onSuccess: async () => {
    prependUseClient();
  },
}));
