import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { imessageComponents } from "./components.js";
import { imessageCapabilities } from "./capabilities.js";
import { imessageFonts } from "./fonts.js";
import { imessageTokens } from "./tokens.js";

const imessageOptionsSchema = z.object({
  /** Contact name shown in the nav bar. */
  contact: z.string().optional(),
  /** Show the on-screen keyboard (default true). */
  keyboard: z.boolean().optional(),
});

/** An iMessage-style iOS skin (light + dark): bubbles, status bar, keyboard. */
export const imessage = defineSkin({
  id: "imessage",
  meta: {
    name: "iMessage (iOS)",
    defaultCanvas: { width: 390, height: 844 },
    supportsThemes: ["light", "dark"],
    capabilities: imessageCapabilities,
    optionsSchema: imessageOptionsSchema,
    fonts: imessageFonts,
  },
  components: imessageComponents,
  tokens: imessageTokens,
});

/** Default export so `@typecaast/skins/imessage` can be lazy-imported uniformly. */
export default imessage;
