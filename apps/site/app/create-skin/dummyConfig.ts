import type { ConfigInput } from "@typecaast/schema";

/**
 * A short canvas-friendly conversation used as the live preview for
 * `/create-skin`. Reuses the playground's billing-toast spirit but trimmed
 * so the editor preview shows bubbles immediately rather than starting
 * mid-thread.
 */
export const editorPreviewConfig: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 480, height: 640 },
    // The id is irrelevant when we pass a `skin` prop on the fly — it just
    // needs to exist so the schema validates. We pick "slack" because the
    // playground's default config does too.
    skin: { id: "slack" },
    composer: "always",
  },
  participants: [
    { id: "ada", name: "Ada Lovelace", isSelf: true },
    { id: "grace", name: "Grace Hopper", color: "#5b3a8e" },
  ],
  timeline: [
    {
      type: "message",
      id: "m1",
      from: "grace",
      text: "hey, can you take a look at this skin draft i'm building?",
    },
    { type: "delay", duration: 700 },
    {
      type: "message",
      id: "m2",
      from: "ada",
      text: "yeah! pop the html in the editor and i'll review it live ↓",
    },
    { type: "delay", duration: 700 },
    {
      type: "typing",
      from: "grace",
      showTypingFor: 1100,
    },
    {
      type: "message",
      id: "m3",
      from: "grace",
      text: "perfect — does the body slot land where i think it does? 👀",
    },
  ],
};
