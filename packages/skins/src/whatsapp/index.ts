import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { whatsappComponents } from "./components.js";
import { whatsappCapabilities } from "./capabilities.js";
import { whatsappTokens } from "./tokens.js";

const whatsappOptionsSchema = z.object({
  /** Contact / group name in the header. */
  contact: z.string().optional(),
  /** Header subtitle (e.g. `"online"`, `"last seen recently"`). */
  status: z.string().optional(),
});

/** A WhatsApp-style skin (light + dark): green accent, double-tick receipts. */
export const whatsapp = defineSkin({
  id: "whatsapp",
  meta: {
    name: "WhatsApp",
    defaultCanvas: { width: 390, height: 760 },
    supportsThemes: ["light", "dark"],
    capabilities: whatsappCapabilities,
    optionsSchema: whatsappOptionsSchema,
  },
  components: whatsappComponents,
  tokens: whatsappTokens,
});
