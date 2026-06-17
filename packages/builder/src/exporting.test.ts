import { describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import {
  embedSnippet,
  installSnippet,
  renderSnippet,
  skinVar,
  toJSON,
} from "./exporting.js";

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

  it("emits a zero-config React embed snippet (skin resolved from config)", () => {
    const s = embedSnippet(config);
    expect(s).toContain('import { Typecaast } from "@typecaast/react"');
    expect(s).toContain('import config from "./typecaast.json"');
    expect(s).toContain("<Typecaast config={config} autoplay />");
    // Single source of truth: no skin import/prop, no loop, no "use client".
    expect(s).not.toContain("@typecaast/skins");
    expect(s).not.toContain("skin=");
    expect(s).not.toContain("loop");
    expect(s).not.toContain("use client");
  });

  it("emits an install line per package manager", () => {
    expect(installSnippet()).toBe("npm install @typecaast/react");
    expect(installSnippet("npm")).toBe("npm install @typecaast/react");
    expect(installSnippet("yarn")).toBe("yarn add @typecaast/react");
    expect(installSnippet("pnpm")).toBe("pnpm add @typecaast/react");
  });

  it("emits a render command with size + theme", () => {
    expect(renderSnippet(config)).toBe(
      "typecaast render typecaast.json --size 1080x1920 --theme dark --format mp4",
    );
  });
});
