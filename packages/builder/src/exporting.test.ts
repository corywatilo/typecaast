import { describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import { embedSnippet, renderSnippet, skinVar, toJSON } from "./exporting.js";

const config: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 1080, height: 1920 },
    theme: "dark",
    skin: { id: "messages-macos" },
  },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [{ type: "message", from: "a", text: "hi" }],
};

describe("export helpers", () => {
  it("camelCases skin ids", () => {
    expect(skinVar("slack")).toBe("slack");
    expect(skinVar("claude-code")).toBe("claudeCode");
    expect(skinVar("messages-macos")).toBe("messagesMacos");
  });

  it("round-trips JSON", () => {
    expect(JSON.parse(toJSON(config))).toEqual(config);
  });

  it("emits a React embed snippet with the right skin import", () => {
    const s = embedSnippet(config);
    // Must lead with the client directive (RSC frameworks) — see embedSnippet.
    expect(s.startsWith('"use client";')).toBe(true);
    expect(s).toContain("@typecaast/react");
    expect(s).toContain("import { messagesMacos }");
    expect(s).toContain("skin={messagesMacos}");
  });

  it("emits a render command with size + theme", () => {
    expect(renderSnippet(config)).toBe(
      "typecaast render typecaast.json --size 1080x1920 --theme dark --format mp4",
    );
  });
});
