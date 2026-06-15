import { prependUseClient } from "../../scripts/prepend-use-client.mjs";
import { defineConfig } from "tsup";

// Per-skin entries get their own subpath export (`@typecaast/skins/slack`, …) so
// the React renderer can lazy-load only the skin a config references.
const SKINS = [
  "slack",
  "telegram",
  "claude-code",
  "imessage",
  "whatsapp",
  "cursor",
  "messages-macos",
  "discord",
];

export default defineConfig((options) => ({
  entry: ["src/index.ts", ...SKINS.map((s) => `src/${s}/index.ts`)],
  format: ["esm", "cjs"],
  dts: !options.watch,
  clean: !options.watch,
  sourcemap: true,
  treeshake: true,
  // Keep shared code (skin-kit, per-skin chunks) split so importing one skin
  // doesn't pull the others.
  splitting: true,
  external: ["react", "react/jsx-runtime", "react-dom"],
  // Skin components render with hooks and pull in skin-kit's theme context, so
  // it's a client module. The directive is re-added post-bundle (esbuild strips
  // it on bundle) so the package — and every per-skin entry — loads in RSC trees.
  onSuccess: async () => {
    prependUseClient();
  },
}));
