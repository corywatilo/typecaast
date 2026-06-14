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
      id: "m1",
      from: "cory",
      text: "i got a billing toast error on the dashboard but i think it's a bug?",
    },
    // Paul escalates to the PostHog app — we show him typing it in the reply box.
    {
      type: "composerType",
      from: "paul",
      text: "@PostHog the billing/spend API call shouldn't show an error toast to the user…",
    },
    { type: "send", id: "m2" },
    // The PostHog app reacts 👀 to signal it saw the mention and is on it
    // (hover the reaction to see who reacted).
    {
      type: "reaction",
      target: "m2",
      emoji: "👀",
      shortcode: "eyes",
      from: "posthog-bot",
      delay: 900,
    },
    {
      type: "message",
      from: "posthog-bot",
      text: "Let me check how exceptions are captured in the frontend.",
      delay: 1400,
    },
    {
      type: "system",
      from: "posthog-bot",
      card: "pr-opened",
      text: "Pull request opened — guards the billing/spend call so it no longer toasts on error.",
      actions: [{ label: "View PR" }, { label: "Open in PostHog Code" }],
    },
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
