import { z } from "zod";
import { defineSkin } from "@typecaast/skin-kit";
import { tuiComponents } from "./components.js";
import { tuiCapabilities } from "./capabilities.js";
import { tuiFonts } from "./fonts.js";

const tuiOptionsSchema = z.object({
  /** Title-bar label (e.g. `"claude — zsh"`). */
  title: z.string().optional(),
});

/** A Claude Code-style terminal (TUI) skin. Dark-only, streaming output. */
export const claudeCode = defineSkin({
  id: "claude-code",
  meta: {
    name: "Claude Code (TUI)",
    defaultCanvas: { width: 720, height: 480 },
    supportsThemes: ["dark"],
    capabilities: tuiCapabilities,
    optionsSchema: tuiOptionsSchema,
    fonts: tuiFonts,
  },
  components: tuiComponents,
});

/** Default export so `@typecaast/skins/claude-code` can be lazy-imported uniformly. */
export default claudeCode;
