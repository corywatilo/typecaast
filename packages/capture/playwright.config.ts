import { defineConfig } from "@playwright/test";

/**
 * Style-scoping verification for captured template skins (PLAN §10, M5.2c).
 * Self-contained: each test builds its page with `page.setContent`, so there's
 * no web server or Storybook dependency — just real Chromium, where shadow-DOM
 * style isolation actually behaves (jsdom can't model the cascade across a
 * shadow boundary).
 */
export default defineConfig({
  testDir: "./scoping",
  forbidOnly: !!process.env.CI,
  reporter: "list",
});
