import { afterEach, describe, expect, it } from "vitest";
import { distill } from "./distill.js";
import { detectionScore } from "./draft.js";
import { mergeThemeDrafts } from "./merge.js";
import { CAPTURE_CASES } from "./fixtures/cases.js";

/**
 * Capture quality bar (PLAN §10, M5.8): across a fixture set of realistic chat
 * layouts, slot auto-detection must clear ≥0.8 (median) with no manual hinting.
 * Captures that can't clear the bar fall back to "draft only" rather than
 * masquerade as finished skins — this test is the gate.
 */

function mount(html: string, selector: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = `<div id="page">${html}</div>`;
  document.body.appendChild(host);
  return host.querySelector(selector) as HTMLElement;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("capture quality bar", () => {
  const scores = CAPTURE_CASES.map((c) => {
    const draft = distill(mount(c.html, c.selector), { name: c.name });
    return { name: c.name, score: detectionScore(draft), draft };
  });

  for (const { name, score } of scores) {
    it(`${name}: detects all five core slots (≥0.8)`, () => {
      expect(score).toBeGreaterThanOrEqual(0.8);
    });
  }

  it("median slot-detection across the set clears the §10 bar", () => {
    const sorted = scores.map((s) => s.score).sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)] ?? 0;
    expect(mid).toBeGreaterThanOrEqual(0.8);
  });
});

describe("light/dark double-capture merge (M5.7)", () => {
  it("attaches dark tokens and keeps light structure", () => {
    const slack = CAPTURE_CASES[0]!;
    const light = distill(mount(slack.html, slack.selector), {
      name: "Slack",
      theme: "light",
    });
    document.body.innerHTML = "";
    // A "dark" capture: same structure, different colors.
    const darkHtml = slack.html
      .replace(/#ffffff/g, "#1a1d21")
      .replace(/#1d1c1d/g, "#d1d2d3");
    const dark = distill(mount(darkHtml, slack.selector), {
      name: "Slack",
      theme: "dark",
    });
    const merged = mergeThemeDrafts(light, dark);
    expect(merged.darkTokens).toBeDefined();
    expect(merged.meta.theme).toBeUndefined();
    // Light structure preserved.
    expect(merged.slots.message).toBe(light.slots.message);
    // Dark tokens carry the dark colors.
    expect(Object.values(merged.darkTokens!.colors)).toContain("#1a1d21");
  });
});
