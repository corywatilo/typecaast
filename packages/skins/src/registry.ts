import type { Skin } from "@typecaast/skin-kit";
import { slack } from "./slack/index.js";
import { claudeCode } from "./claude-code/index.js";
import { imessage } from "./imessage/index.js";
import { whatsapp } from "./whatsapp/index.js";
import { cursor } from "./cursor/index.js";
import { messagesMacos } from "./messages-macos/index.js";

/** The built-in skins, keyed by id (matches `meta.skin.id` in a config). */
export const builtinSkins: Record<string, Skin> = {
  slack,
  "claude-code": claudeCode,
  imessage,
  whatsapp,
  cursor,
  "messages-macos": messagesMacos,
};

/** Resolve a built-in skin by id (e.g. for the CLI / render root). */
export function getSkin(id: string): Skin | undefined {
  return builtinSkins[id];
}
