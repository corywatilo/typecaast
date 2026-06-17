import type { Capabilities } from "@typecaast/skin-kit";

/** iMessage: bubbles + tapback reactions + read receipts; no app/system cards. */
export const imessageCapabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native", // dot bubble
    reaction: "native", // tapbacks
    readReceipt: "native", // "Delivered" / "Read"
    edit: "native",
    delete: "native",
    system: "fallback", // rendered as centered grey text, not an app card
    delay: "native",
  },
  content: {
    text: true,
    image: true,
  },
  reactions: true,
  threads: false,
  readReceipts: true,
};
