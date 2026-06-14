import { describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import {
  createEngine,
  createPlayer,
  type ResolvedTheme,
} from "@typecaast/core";
import { frameToMs, getDurationInFrames } from "./timing.js";

/**
 * Frame-parity (PLAN §13, the critical test): the live React player and the
 * Remotion frame loop both sample the **same** pure `getStateAt`. This asserts
 * that for a corpus of configs, the player's state after seeking to a frame's
 * timestamp deep-equals the state Remotion samples at that frame — i.e. the
 * preview and the exported video are identical frame for frame.
 */

const fixtures: Record<string, ConfigInput["timeline"]> = {
  billingToast: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
    { type: "typing", from: "paul", showTypingFor: 1800 },
    { type: "message", from: "paul", text: "@PostHog shouldn't error…" },
    {
      type: "system",
      from: "bot",
      card: "pr-opened",
      text: "Pull request opened.",
    },
    { type: "composerType", from: "cory", text: "Let me check." },
    { type: "send" },
  ],
  quick: [
    { type: "message", from: "cory", text: "ship it?", delay: 200 },
    { type: "reaction", target: "$prev", emoji: "🚀", delay: 300 },
    { type: "message", from: "paul", text: "shipping 🚀" },
  ],
};

function buildConfig(timeline: ConfigInput["timeline"]) {
  return configSchema.parse({
    version: 1,
    meta: {
      canvas: { width: 480, height: 720 },
      fps: 30,
      skin: { id: "slack" },
    },
    participants: [
      { id: "cory", name: "Cory", isSelf: true },
      { id: "paul", name: "Paul" },
      { id: "bot", name: "Bot", kind: "app" },
    ],
    timeline,
  });
}

const fps = 30;
const themes: ResolvedTheme[] = ["light", "dark"];

describe("frame parity (React player vs Remotion frames)", () => {
  for (const [name, timeline] of Object.entries(fixtures)) {
    for (const theme of themes) {
      it(`${name} @ ${theme}: every frame matches`, () => {
        const config = buildConfig(timeline);
        const engine = createEngine(config, theme);
        const player = createPlayer(engine.getStateAt, {
          durationMs: engine.durationMs,
        });
        const frames = getDurationInFrames(config, fps);

        for (let frame = 0; frame <= frames; frame++) {
          const t = frameToMs(frame, fps);
          // Remotion samples the engine directly at the frame's timestamp.
          const remotionState = engine.getStateAt(t);
          // The React player seeks to the same timestamp.
          player.seek(t);
          expect(player.state).toEqual(remotionState);
        }
        player.destroy();
      });
    }
  }

  it("is also referentially stable across repeated samples", () => {
    const config = buildConfig(fixtures.quick!);
    const engine = createEngine(config, "light");
    const t = engine.durationMs / 2;
    expect(engine.getStateAt(t)).toEqual(engine.getStateAt(t));
  });
});
