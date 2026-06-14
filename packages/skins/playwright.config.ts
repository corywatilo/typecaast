import { defineConfig } from "@playwright/test";

const PORT = 6099;

export default defineConfig({
  testDir: "./visual",
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  webServer: {
    command: `node visual/serve.mjs`,
    url: `http://localhost:${PORT}/iframe.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT) },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  expect: {
    // Absorb sub-pixel AA differences; cross-OS runs need the pinned container.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
