import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { telegramComponents } from "./components.js";
import { telegramCapabilities } from "./capabilities.js";
import { telegramFonts } from "./fonts.js";
import { telegramTokens } from "./tokens.js";

const telegramOptionsSchema = z.object({
  /** Chat title shown in the header (e.g. `"PostHog team"`). */
  title: z.string().optional(),
  /** Alias for the title (matches other contact-style skins). */
  contact: z.string().optional(),
  /** Header subtitle, e.g. `"online"` or `"last seen recently"`. */
  status: z.string().optional(),
});

/** A Telegram-style chat skin (light "Day" + dark "Night"). */
export const telegram = defineSkin({
  id: "telegram",
  meta: {
    name: "Telegram",
    defaultCanvas: { width: 440, height: 780 },
    supportsThemes: ["light", "dark"],
    capabilities: telegramCapabilities,
    optionsSchema: telegramOptionsSchema,
    fonts: telegramFonts,
  },
  components: telegramComponents,
  tokens: telegramTokens,
});
