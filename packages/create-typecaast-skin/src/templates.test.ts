import { describe, expect, it } from "vitest";
import { skinFiles, toNames } from "./templates.js";

describe("toNames", () => {
  it("derives id/name/var from a display name", () => {
    expect(toNames("My Cool Skin")).toEqual({
      id: "my-cool-skin",
      name: "My Cool Skin",
      varName: "myCoolSkin",
    });
  });

  it("handles a single lowercase word", () => {
    expect(toNames("signal")).toEqual({
      id: "signal",
      name: "Signal",
      varName: "signal",
    });
  });

  it("normalizes punctuation and casing", () => {
    expect(toNames("Slack_2.0 Thread!").id).toBe("slack-2-0-thread");
  });
});

describe("skinFiles", () => {
  const files = skinFiles("signal");

  it("emits the five skin files", () => {
    expect(Object.keys(files).sort()).toEqual([
      "README.md",
      "capabilities.ts",
      "components.tsx",
      "index.ts",
      "tokens.ts",
    ]);
  });

  it("substitutes id/name/var into index.ts", () => {
    expect(files["index.ts"]).toContain("export const signal = defineSkin(");
    expect(files["index.ts"]).toContain('id: "signal"');
    expect(files["index.ts"]).toContain('name: "Signal"');
  });

  it("the components import the skin-kit primitives", () => {
    const c = files["components.tsx"]!;
    expect(c).toContain('from "@typecaast/skin-kit"');
    expect(c).toContain("MessageContent");
    expect(c).toContain("fadeSlideIn");
    // No stray ${} interpolation leaked into the generated code.
    expect(c).not.toContain("${");
  });
});
