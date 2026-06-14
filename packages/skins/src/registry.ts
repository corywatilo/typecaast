import type { Skin } from "@typecaast/skin-kit";
import { slack } from "./slack/index.js";

/** The built-in skins, keyed by id (matches `meta.skin.id` in a config). */
export const builtinSkins: Record<string, Skin> = {
  slack,
};

/** Resolve a built-in skin by id (e.g. for the CLI / render root). */
export function getSkin(id: string): Skin | undefined {
  return builtinSkins[id];
}
