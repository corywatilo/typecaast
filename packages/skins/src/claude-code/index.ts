import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { tuiComponents } from "./components.js";
import { tuiCapabilities } from "./capabilities.js";
import { tuiFonts } from "./fonts.js";
import { tuiTokens } from "./tokens.js";

const tuiOptionsSchema = z.object({
  /** Title-bar label (e.g. `"claude — zsh"`). */
  title: z.string().optional(),
});

/** A Claude Code-style terminal (TUI) skin with streaming output (light + dark). */
export const claudeCode = defineSkin({
  id: "claude-code",
  meta: {
    name: "Claude Code (TUI)",
    defaultCanvas: { width: 600, height: 500 },
    supportsThemes: ["dark", "light"],
    capabilities: tuiCapabilities,
    optionsSchema: tuiOptionsSchema,
    fonts: tuiFonts,
  },
  components: tuiComponents,
  tokens: tuiTokens,
});

/** Default export so `@typecaast/skins/claude-code` can be lazy-imported uniformly. */
export default claudeCode;
