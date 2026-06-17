import { describe, expect, it } from "vitest";
import { STEP_TYPES, timelineSchema, timelineStepSchema } from "./timeline.js";

describe("timelineStepSchema", () => {
  it("accepts the billing-toast timeline from the spec", () => {
    const timeline = [
      { type: "message", from: "cory", text: "i got a billing toast error?" },
      { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
      { type: "typing", from: "paul", showTypingFor: 1800 },
      { type: "message", from: "paul", text: "@PostHog shouldn't error…" },
      {
        type: "message",
        from: "cory",
        text: "here's the toast:",
        images: [
          { src: "./toast.png", alt: "billing error toast", width: 320 },
        ],
      },
      {
        type: "system",
        from: "posthog-bot",
        card: "pr-opened",
        text: "Pull request opened.",
        actions: [{ label: "View PR" }, { label: "Open in PostHog Code" }],
      },
      { type: "composerType", from: "cory", text: "Let me check." },
      { type: "send" },
    ];
    expect(() => timelineSchema.parse(timeline)).not.toThrow();
  });

  it("covers every declared step type", () => {
    expect([...STEP_TYPES].sort()).toEqual(
      [
        "composerType",
        "delay",
        "delete",
        "edit",
        "message",
        "reaction",
        "readReceipt",
        "send",
        "system",
        "typing",
      ].sort(),
    );
  });

  it("accepts per-step overrides on a message", () => {
    expect(() =>
      timelineStepSchema.parse({
        type: "message",
        from: "cory",
        text: "hi",
        typing: { showTypingFor: 1000 },
        instant: false,
        id: "m1",
      }),
    ).not.toThrow();
  });

  it("requires `from` on a message", () => {
    expect(() =>
      timelineStepSchema.parse({ type: "message", text: "hi" }),
    ).toThrow();
  });

  it("requires text on composerType", () => {
    expect(() =>
      timelineStepSchema.parse({ type: "composerType", from: "cory" }),
    ).toThrow();
  });

  it("requires target + emoji on a reaction", () => {
    expect(() =>
      timelineStepSchema.parse({ type: "reaction", target: "$prev" }),
    ).toThrow();
  });

  it("requires duration on a delay", () => {
    expect(() => timelineStepSchema.parse({ type: "delay" })).toThrow();
    expect(() =>
      timelineStepSchema.parse({ type: "delay", duration: 800 }),
    ).not.toThrow();
  });

  it("rejects an unknown step type", () => {
    expect(() =>
      timelineStepSchema.parse({ type: "explode", from: "cory" }),
    ).toThrow();
  });
});
