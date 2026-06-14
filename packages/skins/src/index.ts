/**
 * `@typecaast/skins` — the built-in, pixel-faithful presets. Each is a `Skin`
 * (see `@typecaast/skin-kit`) usable by both the React and Remotion renderers.
 */

export { slack } from "./slack/index.js";
export { SLACK_COLORS, type SlackColors } from "./slack/tokens.js";
export { claudeCode } from "./claude-code/index.js";
export { imessage } from "./imessage/index.js";
export { whatsapp } from "./whatsapp/index.js";
export { cursor } from "./cursor/index.js";
export { messagesMacos } from "./messages-macos/index.js";
export { builtinSkins, getSkin } from "./registry.js";
