import type { Skin } from "./types.js";

/**
 * Identity helper for type-safety and a single registration point when
 * authoring a skin. Keeping it a function (rather than a bare object) lets us
 * add validation/registration later without changing skin call sites.
 */
export function defineSkin(skin: Skin): Skin {
  return skin;
}
