import { prependUseClient } from "../../scripts/prepend-use-client.mjs";
import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  external: ["react", "react/jsx-runtime"],
  // Ships React context + hooks (ThemeProvider's createContext at module scope),
  // so it's a client module. The directive is re-added post-bundle because
  // esbuild strips it when bundling — lets it load in RSC trees.
  onSuccess: async () => {
    prependUseClient();
  },
}));
