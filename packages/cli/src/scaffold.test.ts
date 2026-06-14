import { describe, expect, it } from "vitest";
import type { SkinDraft } from "@typecaast/capture/draft";
import { scaffoldSkinFiles, toNames } from "./scaffold.js";

const draft: SkinDraft = {
  version: 1,
  meta: { name: "Slack Capture", sourceUrl: "https://slack.test" },
  slots: {
    frame: '<div><div data-tc-slot="messages">{{messages}}</div></div>',
    message:
      '<div><span data-tc-slot="author">{{author}}</span><div data-tc-slot="body">{{body}}</div></div>',
  },
  css: "",
  tokens: { colors: { "color-1": "#1d1c1d" } },
  detection: {
    frame: { found: true, detected: ["messages"], confidence: 1 },
    message: { found: true, detected: ["author", "body"], confidence: 0.5 },
    composer: { found: false, detected: [], confidence: 0 },
    typing: { found: false, detected: [], confidence: 0 },
  },
  warnings: ["No composer detected — add one by hand if the skin needs it."],
};

describe("toNames", () => {
  it("derives id/name/var, falling back to the draft name", () => {
    expect(toNames("", "Slack Capture")).toEqual({
      id: "slack-capture",
      name: "Slack Capture",
      varName: "slackCapture",
    });
    expect(toNames("Discord-style", "x").id).toBe("discord-style");
  });
});

describe("scaffoldSkinFiles", () => {
  const files = scaffoldSkinFiles(draft, "Slack-style");

  it("emits the package files", () => {
    expect(Object.keys(files).sort()).toEqual([
      "README.md",
      "capabilities.ts",
      "draft.json",
      "index.ts",
    ]);
  });

  it("embeds the draft and wires templateSkinFromDraft", () => {
    expect(JSON.parse(files["draft.json"]!).meta.name).toBe("Slack Capture");
    expect(files["index.ts"]).toContain("templateSkinFromDraft");
    expect(files["index.ts"]).toContain('id: "slack-style"');
    expect(files["index.ts"]).toContain("export const slackStyle");
  });

  it("turns detection + warnings into a cleanup checklist", () => {
    const readme = files["README.md"]!;
    expect(readme).toContain("- [x] **Author** slot");
    expect(readme).toContain("- [ ] **Avatar** slot"); // not detected
    expect(readme).toContain("- [ ] **Composer** detected");
    expect(readme).toContain("No composer detected");
  });
});
