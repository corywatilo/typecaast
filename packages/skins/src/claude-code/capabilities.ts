import type { Capabilities } from "@typecaast/skin-kit";

/** A terminal has no avatars/reactions/threads; typing is a spinner. */
export const tuiCapabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native", // spinner
    system: "native", // tool/output lines
    reaction: "unsupported",
    readReceipt: "unsupported",
    edit: "native",
    delete: "native",
    delay: "native",
  },
  content: {
    text: true,
    image: false, // terminals don't render images
  },
  reactions: false,
  threads: false,
  readReceipts: false,
};
