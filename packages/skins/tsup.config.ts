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
  // Skin components render with hooks and pull in skin-kit's theme context, so
  // it's a client module. The directive is re-added post-bundle (esbuild strips
  // it on bundle) so the package loads in RSC trees.
  onSuccess: async () => {
    prependUseClient();
  },
}));
