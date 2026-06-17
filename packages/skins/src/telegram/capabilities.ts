import type { Capabilities } from "@typecaast/skin-kit";

/** What the Telegram skin supports and how it represents each event/content type. */
export const telegramCapabilities: Capabilities = {
  events: {
    message: "native",
    reaction: "native",
    typing: "native", // "X is typing…" (rendered in-thread)
    composerType: "native",
    send: "native",
    edit: "native",
    delete: "native",
    readReceipt: "unsupported", // shown as double-ticks on the bubble, not a step
    system: "native", // bot message + inline keyboard
    delay: "native",
  },
  content: {
    text: true,
    image: true,
  },
  reactions: true,
  threads: false,
  readReceipts: false,
};
