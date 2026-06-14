import { z } from "zod";
import { defineSkin, type Capabilities } from "@typecaast/skin-kit";
import { discordComponents } from "./components.js";

const discordCapabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native",
    reaction: "native",
    system: "native",
    edit: "native",
    delete: "native",
    readReceipt: "unsupported",
    beat: "native",
  },
  content: { text: true, image: true },
  reactions: true,
  threads: true,
  readReceipts: false,
};

const discordOptionsSchema = z.object({
  /** Channel name (rendered after the `#`). */
  channel: z.string().optional(),
});

/** A Discord-style channel skin (dark): role colors, grouped messages. */
export const discord = defineSkin({
  id: "discord",
  meta: {
    name: "Discord",
    defaultCanvas: { width: 600, height: 480 },
    supportsThemes: ["dark"],
    capabilities: discordCapabilities,
    optionsSchema: discordOptionsSchema,
  },
  components: discordComponents,
});
