import { expect, test } from "@playwright/test";

/**
 * Visual-regression gate (PLAN §13): snapshot each skin's deterministic
 * (frozen) stories in light + dark and compare against committed baselines.
 * Animated stories are excluded (rAF → non-deterministic at capture time).
 *
 * Baselines are environment-specific; regenerate in the pinned runtime
 * (`pnpm test:visual:update`) when fonts/Chromium change.
 */
const STORIES = [
  "skins-slack--light-complete",
  "skins-slack--dark-complete",
  "skins-slack--mid-thread",
  "skins-slack--dark-mid-thread",
  "skins-claude-code-tui--complete",
  "skins-claude-code-tui--streaming",
  "skins-imessage-ios--light-complete",
  "skins-imessage-ios--dark-complete",
  "skins-imessage-ios--typing",
  "skins-whatsapp--light-complete",
  "skins-whatsapp--dark-complete",
  "skins-cursor-panel--dark-complete",
  "skins-cursor-panel--light-complete",
];

for (const id of STORIES) {
  test(id, async ({ page }) => {
    await page.goto(`/iframe.html?id=${id}&viewMode=story`);
    await page.waitForLoadState("networkidle");
    // Let declared web fonts settle before capturing.
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${id}.png`, { fullPage: true });
  });
}
