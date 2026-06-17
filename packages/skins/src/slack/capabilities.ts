import type { Capabilities } from "@typecaast/skin-kit";

/** What the Slack skin supports and how it represents each event/content type. */
export const slackCapabilities: Capabilities = {
  events: {
    message: "native",
    reaction: "native",
    typing: "native", // "X is typing…"
    composerType: "native",
    send: "native",
    edit: "native",
    delete: "native",
    readReceipt: "unsupported", // Slack has no per-message read receipts in threads
    system: "native", // app/PR cards
    delay: "native",
  },
  content: {
    text: true,
    image: true,
  },
  reactions: true,
  threads: true,
  readReceipts: false,
};
