import type { ConfigInput } from "@typecaast/schema";

/** The spec's billing-toast thread — the hero/landing demo. */
export const billingToast: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 480, height: 640 },
    skin: { id: "slack", options: { channel: "#alerts" } },
  },
  participants: [
    { id: "cory", name: "Cory Watilo", isSelf: true },
    { id: "paul", name: "Paul D'Ambra", color: "#5b3a8e" },
    { id: "posthog-bot", name: "PostHog", kind: "app" },
  ],
  timeline: [
    {
      type: "message",
      from: "cory",
      text: "i got a billing toast error on the dashboard but i think it's a bug?",
    },
    { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
    { type: "typing", from: "paul", showTypingFor: 1800 },
    {
      type: "message",
      from: "paul",
      text: "@PostHog the billing/spend API call shouldn't show an error toast to the user…",
    },
    {
      type: "system",
      from: "posthog-bot",
      card: "pr-opened",
      text: "Pull request opened.",
      actions: [{ label: "View PR" }, { label: "Open in PostHog Code" }],
    },
    {
      type: "composerType",
      from: "cory",
      text: "Let me check how exceptions are captured in the frontend.",
    },
    { type: "send" },
  ],
};

/** A short, skin-agnostic conversation for the gallery cards. */
export function genericConfig(
  skinId: string,
  canvas: { width: number; height: number },
  options?: Record<string, unknown>,
): ConfigInput {
  return {
    version: 1,
    meta: { canvas, skin: { id: skinId, ...(options ? { options } : {}) } },
    participants: [
      { id: "you", name: "You", isSelf: true },
      { id: "sam", name: "Sam", color: "#ff7a59" },
    ],
    timeline: [
      {
        type: "message",
        from: "sam",
        text: "this is going to be so good 🚀",
        id: "m1",
      },
      { type: "reaction", target: "m1", emoji: "🔥", from: "you", delay: 900 },
      { type: "typing", from: "sam", showTypingFor: 1400 },
      { type: "message", from: "sam", text: "shipping it today" },
      { type: "composerType", from: "you", text: "let's go" },
      { type: "send" },
    ],
  };
}
