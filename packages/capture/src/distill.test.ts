import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { distill } from "./distill.js";
import { skinDraftSchema, detectionScore } from "./draft.js";
import { SLACK_THREAD_HTML } from "./fixtures/slack-thread.js";

let root: HTMLElement;

beforeEach(() => {
  const host = document.createElement("div");
  host.innerHTML = SLACK_THREAD_HTML;
  root = host.firstElementChild as HTMLElement;
  document.body.appendChild(root);
});
afterEach(() => {
  root.remove();
});

describe("distill", () => {
  it("emits a schema-valid SkinDraft", () => {
    const draft = distill(root, { name: "Slack" });
    expect(() => skinDraftSchema.parse(draft)).not.toThrow();
  });

  it("detects the repeating message row and its inner slots", () => {
    const draft = distill(root, { name: "Slack" });
    expect(draft.detection.message.found).toBe(true);
    expect(draft.detection.message.detected).toEqual(
      expect.arrayContaining(["author", "avatar", "body", "time"]),
    );
    // The message template carries slot markers, not literal content.
    expect(draft.slots.message).toContain('data-tc-slot="author"');
    expect(draft.slots.message).toContain('data-tc-slot="avatar"');
    expect(draft.slots.message).toContain('data-tc-slot="body"');
    expect(draft.slots.message).not.toContain("Cory Watilo");
  });

  it("carves a frame with a messages slot", () => {
    const draft = distill(root, { name: "Slack" });
    expect(draft.detection.frame.found).toBe(true);
    expect(draft.slots.frame).toContain('data-tc-slot="messages"');
    expect(draft.slots.frame).toContain("#alerts");
  });

  it("detects the composer", () => {
    const draft = distill(root, { name: "Slack" });
    expect(draft.detection.composer.found).toBe(true);
    expect(draft.slots.composer).toContain('data-tc-slot="composer"');
  });

  it("drops hidden rows and data-* attributes", () => {
    const draft = distill(root, { name: "Slack" });
    const all = JSON.stringify(draft);
    expect(all).not.toContain("offscreen draft");
    expect(all).not.toContain("data-msg-id");
    expect(draft.warnings.some((w) => /hidden/i.test(w))).toBe(true);
  });

  it("extracts color and font tokens", () => {
    const draft = distill(root, { name: "Slack" });
    const colors = Object.values(draft.tokens.colors);
    expect(colors).toContain("#1d1c1d");
    expect(draft.tokens.fonts).toBeDefined();
  });

  it("clears the §10 slot-detection quality bar (≥0.8)", () => {
    const draft = distill(root, { name: "Slack" });
    expect(detectionScore(draft)).toBeGreaterThanOrEqual(0.8);
  });

  it("does not mutate the source DOM", () => {
    distill(root, { name: "Slack" });
    expect(root.querySelector(".sender")?.textContent).toBe("Cory Watilo");
    expect(root.querySelector("[data-msg-id]")).not.toBeNull();
  });
});
