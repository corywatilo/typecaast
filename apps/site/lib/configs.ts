import type { ConfigInput } from "@typecaast/schema";

/** The spec's billing-toast thread — the hero/landing demo. */
export const billingToast: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 480, height: 640 },
    skin: { id: "slack", options: { channel: "#alerts" } },
    composer: "always",
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
    { type: "delay", duration: 1400 },
    {
      type: "message",
      from: "posthog-bot",
      text: "Let me check how exceptions are captured in the frontend.",
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

/**
 * A short, skin-agnostic conversation for the gallery cards. It both *explains*
 * Typecaast (one JSON config → every skin, light/dark, export as React or video)
 * and *demonstrates* features as it plays: a reaction, typing indicators, a live
 * edit fixing a typo, composer typing → send, and a closing read receipt. Steps a
 * given skin can't render drop gracefully, so the same script is safe everywhere.
 */
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
        text: "how'd you mock that chat demo up so fast? 👀",
        id: "m1",
      },
      { type: "reaction", target: "m1", emoji: "😏", from: "you", delay: 800 },
      { type: "typing", from: "you", showTypingFor: 1200 },
      {
        type: "message",
        from: "you",
        text: "typecaast — it's all one JSON file",
        id: "m2",
      },
      { type: "typing", from: "sam", showTypingFor: 1100 },
      {
        type: "message",
        from: "sam",
        text: "wait it does evry skin?",
        id: "m3",
      },
      { type: "delay", duration: 900 },
      // Fix the typo live — shows the `edit` feature.
      { type: "edit", target: "m3", text: "wait it does every skin?" },
      {
        type: "composerType",
        from: "you",
        text: "slack, imessage, telegram… same script ✨",
      },
      { type: "send", id: "m4" },
      { type: "typing", from: "sam", showTypingFor: 900 },
      { type: "message", from: "sam", text: "and light + dark?", id: "m5" },
      { type: "readReceipt", by: "sam", target: "m4" },
      {
        type: "composerType",
        from: "you",
        text: "both. export as a React component or a video 🎬",
      },
      { type: "send" },
    ],
  };
}

/**
 * The Claude Code / Cursor cards aren't multiplayer chats — they're a single
 * person working with an AI assistant. This script plays "human asks, assistant
 * does the work" using only steps these skins render natively (message,
 * composerType, send, typing/spinner, and `system` tool-output lines). The
 * assistant participant is `kind: "app"` and stays unlabeled in these UIs.
 */
export function agentConfig(
  skinId: string,
  canvas: { width: number; height: number },
  options?: Record<string, unknown>,
): ConfigInput {
  return {
    version: 1,
    meta: { canvas, skin: { id: skinId, ...(options ? { options } : {}) } },
    participants: [
      { id: "you", name: "You", isSelf: true },
      { id: "agent", name: "Assistant", kind: "app", color: "#c9885a" },
    ],
    timeline: [
      {
        type: "composerType",
        from: "you",
        text: "add a dark mode toggle to the gallery",
      },
      { type: "send", id: "u1" },
      { type: "typing", from: "agent", showTypingFor: 1500 },
      { type: "system", from: "agent", text: "Read apps/site/app/globals.css" },
      { type: "system", from: "agent", text: "Edited 2 files (+38 −4)" },
      {
        type: "message",
        from: "agent",
        text: "Added a theme toggle — it follows the system preference by default.",
        id: "a1",
      },
      {
        type: "composerType",
        from: "you",
        text: "can you add a keyboard shortcut too?",
      },
      { type: "send", id: "u2" },
      { type: "typing", from: "agent", showTypingFor: 1300 },
      {
        type: "system",
        from: "agent",
        text: "Edited apps/site/app/layout.tsx",
      },
      {
        type: "message",
        from: "agent",
        text: "Done — Cmd+Shift+L cycles light, dark, and auto.",
        id: "a2",
      },
      { type: "composerType", from: "you", text: "perfect — ship it 🚀" },
      { type: "send", id: "u3" },
      { type: "typing", from: "agent", showTypingFor: 1200 },
      { type: "message", from: "agent", text: "Pushed to master ✅" },
    ],
  };
}
