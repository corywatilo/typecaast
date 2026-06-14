import { describe, expect, it } from "vitest";
import {
  CONFIG_VERSION,
  configJsonSchema,
  configSchema,
  type ConfigInput,
} from "./config.js";

const billingToast: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 880, height: 720 },
    skin: { id: "slack", options: { channel: "#alerts" } },
  },
  participants: [
    { id: "cory", name: "Cory Watilo", isSelf: true },
    { id: "paul", name: "Paul D'Ambra", color: "#5b3a8e" },
    { id: "posthog-bot", name: "PostHog", kind: "app" },
  ],
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
    { type: "typing", from: "paul", showTypingFor: 1800 },
    { type: "composerType", from: "cory", text: "Let me check." },
    { type: "send" },
  ],
};

describe("configSchema", () => {
  it("parses a full config and fills pacing defaults when omitted", () => {
    const config = configSchema.parse(billingToast);
    expect(config.pacing.readingWpm).toBe(240);
    expect(config.pacing.typingCps).toBe(14);
    expect(config.meta.theme).toBe("auto");
    expect(config.participants).toHaveLength(3);
    expect(config.timeline).toHaveLength(5);
  });

  it("merges partial pacing over defaults", () => {
    const config = configSchema.parse({
      ...billingToast,
      pacing: { typingCps: 20 },
    });
    expect(config.pacing.typingCps).toBe(20);
    expect(config.pacing.readingWpm).toBe(240);
  });

  it("rejects a config version newer than the runtime", () => {
    expect(() =>
      configSchema.parse({ ...billingToast, version: CONFIG_VERSION + 1 }),
    ).toThrow();
  });
});

describe("configJsonSchema", () => {
  it("produces a draft-07 object schema with the top-level properties", () => {
    const json = configJsonSchema();
    expect(json.type).toBe("object");
    expect(Object.keys(json.properties as object)).toEqual([
      "version",
      "meta",
      "participants",
      "pacing",
      "timeline",
    ]);
  });
});
