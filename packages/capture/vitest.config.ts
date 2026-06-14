import { defineConfig } from "vitest/config";

export default defineConfig({
  // `scoping/` holds Playwright specs (real browser) — run via `test:scoping`.
  test: { environment: "jsdom", exclude: ["scoping/**", "node_modules/**"] },
  esbuild: { jsx: "automatic" },
});
