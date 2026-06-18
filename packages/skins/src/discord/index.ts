import { z } from "zod";
import { defineSkin, type Capabilities } from "@typecaast/skin-kit";
import { discordComponents } from "./components.js";
import { discordTokens } from "./tokens.js";

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
    delay: "native",
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

/** A Discord-style channel skin (light + dark): role colors, grouped messages. */
export const discord = defineSkin({
  id: "discord",
  meta: {
    name: "Discord",
    defaultCanvas: { width: 600, height: 470 },
    supportsThemes: ["dark", "light"],
    capabilities: discordCapabilities,
    optionsSchema: discordOptionsSchema,
  },
  components: discordComponents,
  tokens: discordTokens,
});

/** Default export so `@typecaast/skins/discord` can be lazy-imported uniformly. */
export default discord;
