import type { ConfigInput } from "@typecaast/schema";
import { billingToast } from "./configs";

/**
 * The hero tab switcher plays the *same idea* — "ship an AI bot, prove it works"
 * — across four UIs, but each script only uses steps that skin renders natively.
 * Slack and Telegram have reactions; the coding agents (Claude Code, Cursor) do
 * not, so those lean on `system` tool-output lines instead. One config per tab,
 * all rendered with `fit="reflow"` + `isolate` so they share one frame at native
 * text size regardless of canvas shape.
 */

/** A touch quicker than the default 14 cps so the hero demos don't dawdle. */
const HERO_PACING = { typingCps: 22 } as const;

/** Slack — the full-feature take: a mention, a 👀 reaction, a PR result card. */
export const slackHero: ConfigInput = { ...billingToast, pacing: HERO_PACING };

/** Telegram — a support bot chat. Reactions are native here, so we use one. */
export const telegramHero: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 370, height: 650 },
    skin: { id: "telegram" },
    composer: "always",
  },
  pacing: HERO_PACING,
  participants: [
    { id: "you", name: "You", isSelf: true },
    { id: "bot", name: "Acme Assistant", kind: "app" },
  ],
  timeline: [
    {
      type: "message",
      from: "you",
      text: "is the API down? i'm getting 500s on /charges",
      id: "m1",
    },
    { type: "typing", from: "bot", showTypingFor: 1300 },
    {
      type: "message",
      from: "bot",
      text: "No incident on our side — /charges is green. Want me to check your last few requests?",
      id: "m2",
    },
    { type: "reaction", target: "m2", emoji: "🙏", from: "you", delay: 700 },
    { type: "composerType", from: "you", text: "yes please" },
    { type: "send", id: "m3" },
    { type: "typing", from: "bot", showTypingFor: 1400 },
    {
      type: "message",
      from: "bot",
      text: "Found it: a test key hit live mode. Swap to your sk_test_… key and they'll 200.",
    },
  ],
};

/**
 * Claude Code — a terminal coding agent. No reactions; the work shows up as
 * `system` tool-output lines (reads, edits, the test run).
 */
export const claudeCodeHero: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 600, height: 500 },
    skin: { id: "claude-code" },
    composer: "always",
  },
  pacing: HERO_PACING,
  participants: [
    { id: "you", name: "You", isSelf: true },
    { id: "agent", name: "Claude", kind: "app", color: "#c9885a" },
  ],
  timeline: [
    {
      type: "composerType",
      from: "you",
      text: "fix the failing build — the types are red",
    },
    { type: "send", id: "u1" },
    { type: "typing", from: "agent", showTypingFor: 1500 },
    {
      type: "system",
      from: "agent",
      text: "Read packages/react/src/typecaast.tsx",
    },
    { type: "system", from: "agent", text: "Edited 1 file (+6 −2)" },
    {
      type: "message",
      from: "agent",
      text: "The `isolate` prop wasn't threaded through the Suspense path. Fixed — types pass now.",
      id: "a1",
    },
    { type: "composerType", from: "you", text: "run the gate" },
    { type: "send", id: "u2" },
    { type: "typing", from: "agent", showTypingFor: 1300 },
    {
      type: "system",
      from: "agent",
      text: "pnpm typecheck && pnpm test — 142 passed",
    },
    { type: "message", from: "agent", text: "All green. Want me to commit?" },
  ],
};

/**
 * Cursor — the in-editor AI panel (model "Mythos"). Like Claude Code it has no
 * reactions; it shows a fenced code snippet (Cursor borders these) and a
 * `system` edit line.
 */
export const cursorHero: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 350, height: 520 },
    skin: { id: "cursor", options: { model: "Mythos" } },
    composer: "always",
  },
  pacing: HERO_PACING,
  participants: [
    { id: "you", name: "You", isSelf: true },
    { id: "agent", name: "Mythos", kind: "app", color: "#c9885a" },
  ],
  timeline: [
    {
      type: "composerType",
      from: "you",
      text: "add a keyboard shortcut for the theme toggle",
    },
    { type: "send", id: "u1" },
    { type: "typing", from: "agent", showTypingFor: 1500 },
    {
      type: "message",
      from: "agent",
      text: 'Bound ⌘⇧L to cycle the theme:\n```ts\nuseHotkey("mod+shift+l", cycleTheme);\n```',
      id: "a1",
    },
    { type: "system", from: "agent", text: "Edited app/layout.tsx" },
    {
      type: "composerType",
      from: "you",
      text: "nice — does it work inside the embed too?",
    },
    { type: "send", id: "u2" },
    { type: "typing", from: "agent", showTypingFor: 1300 },
    {
      type: "message",
      from: "agent",
      text: "Yep — it cycles light → dark → auto anywhere the provider mounts.",
    },
  ],
};
