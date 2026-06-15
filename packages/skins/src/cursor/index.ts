import { z } from "zod";
import { defineSkin, type Capabilities } from "@typecaast/skin-kit";
import { cursorComponents } from "./components.js";
import { cursorTokens } from "./tokens.js";

const cursorCapabilities: Capabilities = {
  events: {
    message: "native",
    composerType: "native",
    send: "native",
    typing: "native",
    system: "native",
    reaction: "unsupported",
    readReceipt: "unsupported",
    edit: "native",
    delete: "native",
    beat: "native",
  },
  content: { text: true, image: true },
  reactions: false,
  threads: false,
  readReceipts: false,
};

const cursorOptionsSchema = z.object({
  title: z.string().optional(),
});

/** A Cursor-style AI side-panel skin (dark + light) — covers "MCP in Cursor". */
export const cursor = defineSkin({
  id: "cursor",
  meta: {
    name: "Cursor panel",
    defaultCanvas: { width: 400, height: 600 },
    supportsThemes: ["dark", "light"],
    capabilities: cursorCapabilities,
    optionsSchema: cursorOptionsSchema,
  },
  components: cursorComponents,
  tokens: cursorTokens,
});

/** Default export so `@typecaast/skins/cursor` can be lazy-imported uniformly. */
export default cursor;
