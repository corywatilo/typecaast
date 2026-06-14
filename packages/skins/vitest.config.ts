import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Only unit tests in src/; the Playwright visual specs live in visual/.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  esbuild: { jsx: "automatic" },
});
