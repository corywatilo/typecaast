import type { Capabilities } from "@typecaast/skin-kit";

/** WhatsApp: bubbles + emoji reactions + double-tick receipts; no app cards. */
export const whatsappCapabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native",
    reaction: "native",
    readReceipt: "native", // double ticks
    edit: "native",
    delete: "native",
    system: "fallback", // centred system pill
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
