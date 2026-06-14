import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { slackComponents } from "./components.js";
import { slackCapabilities } from "./capabilities.js";
import { slackFonts } from "./fonts.js";
import { slackTokens } from "./tokens.js";

const slackOptionsSchema = z.object({
  /** Channel label shown in the thread header (e.g. `"#alerts"`). */
  channel: z.string().optional(),
  showThreadHeader: z.boolean().optional(),
});

/** A Slack-style thread skin (light + dark). Pixel-faithful, inert chrome. */
export const slack = defineSkin({
  id: "slack",
  meta: {
    name: "Slack",
    defaultCanvas: { width: 880, height: 720 },
    supportsThemes: ["light", "dark"],
    capabilities: slackCapabilities,
    optionsSchema: slackOptionsSchema,
    fonts: slackFonts,
  },
  components: slackComponents,
  tokens: slackTokens,
});
