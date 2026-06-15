import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { TypecaastStage } from "@typecaast/skin-kit";
import { claudeCode } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 720, height: 460 },
    skin: { id: "claude-code", options: { title: "claude — zsh" } },
  },
  participants: [
    { id: "user", name: "You", isSelf: true },
    { id: "claude", name: "Claude", kind: "app" },
  ],
  timeline: [
    { type: "composerType", from: "user", text: "why is the build failing?" },
    { type: "send" },
    { type: "typing", from: "claude", showTypingFor: 1500 },
    {
      type: "message",
      from: "claude",
      text: "The build fails because ResolvedTheme is imported from @typecaast/schema, but it lives in @typecaast/core.",
    },
    {
      type: "system",
      from: "claude",
      card: "tool",
      text: "Read packages/remotion/src/frame-parity.test.ts",
    },
    { type: "typing", from: "claude", showTypingFor: 1100 },
    {
      type: "message",
      from: "claude",
      text: "Fixed — importing it from @typecaast/core now. Re-running typecheck.",
    },
    { type: "composerType", from: "user", text: "thanks, ship it" },
  ],
});

function Window({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 720,
        height: 460,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}

function Frozen({ frac }: { frac: number }) {
  const engine = createEngine(config, "dark", claudeCode.meta.capabilities);
  return (
    <Window>
      <TypecaastStage
        state={engine.getStateAt(engine.durationMs * frac)}
        skin={claudeCode}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/Claude Code (TUI)" };
export default meta;
type Story = StoryObj;

export const Complete: Story = {
  name: "Complete",
  render: () => <Frozen frac={1} />,
};

export const Streaming: Story = {
  name: "Streaming (mid)",
  render: () => <Frozen frac={0.62} />,
};
