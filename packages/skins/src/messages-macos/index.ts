import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { macosComponents } from "./components.js";
import { imessageCapabilities } from "../imessage/capabilities.js";
import { imessageFonts } from "../imessage/fonts.js";
import { imessageTokens } from "../imessage/tokens.js";

const macosOptionsSchema = z.object({
  contact: z.string().optional(),
});

/**
 * macOS Messages — the desktop counterpart to the iOS skin. Window chrome +
 * a conversation sidebar + a wider layout, sharing iMessage's bubbles, tokens,
 * fonts, and capabilities. Distinct skin, shared internals.
 */
export const messagesMacos = defineSkin({
  id: "messages-macos",
  meta: {
    name: "Messages (macOS)",
    defaultCanvas: { width: 900, height: 600 },
    supportsThemes: ["light", "dark"],
    capabilities: imessageCapabilities,
    optionsSchema: macosOptionsSchema,
    fonts: imessageFonts,
  },
  components: macosComponents,
  tokens: imessageTokens,
});

/** Default export so `@typecaast/skins/messages-macos` can be lazy-imported uniformly. */
export default messagesMacos;
