/**
 * `@typecaast/skins` — the built-in, pixel-faithful presets. Each is a `Skin`
 * (see `@typecaast/skin-kit`) usable by both the React and Remotion renderers.
 *
 * Client module: the build prepends `"use client"` to the bundled output (see
 * tsup.config + scripts/prepend-use-client.mjs) since skin components render
 * with hooks and pull in skin-kit's theme context — so it loads in RSC trees.
 */

export { slack } from "./slack/index.js";
export { SLACK_COLORS, type SlackColors } from "./slack/tokens.js";
export { telegram } from "./telegram/index.js";
export { TELEGRAM_COLORS, type TelegramColors } from "./telegram/tokens.js";
export { claudeCode } from "./claude-code/index.js";
export { imessage } from "./imessage/index.js";
export { whatsapp } from "./whatsapp/index.js";
export { cursor } from "./cursor/index.js";
export { messagesMacos } from "./messages-macos/index.js";
export { discord } from "./discord/index.js";
export { builtinSkins, getSkin } from "./registry.js";
