import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { Typecaast, TypecaastStage } from "@typecaast/react";
import { discord } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 600, height: 460 },
    skin: { id: "discord", options: { channel: "dev" } },
  },
  participants: [
    { id: "me", name: "you", isSelf: true, color: "#5865f2" },
    { id: "ana", name: "ana", color: "#f47fff" },
    { id: "bot", name: "GitHub", kind: "app", color: "#3ba55c" },
  ],
  timeline: [
    {
      type: "message",
      from: "ana",
      text: "pushed the fix to `main` 🎉",
      id: "m1",
    },
    { type: "reaction", target: "m1", emoji: "🚀", from: "me", delay: 700 },
    { type: "message", from: "ana", text: "running CI now" },
    { type: "system", from: "bot", card: "ci", text: "CI passed on main" },
    { type: "typing", from: "me", showTypingFor: 1400 },
    { type: "message", from: "me", text: "nice work @ana, shipping it" },
    { type: "composerType", from: "me", text: "deploying to prod now" },
  ],
});

function Window({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 600,
        height: 460,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}

function Frozen({ frac }: { frac: number }) {
  const engine = createEngine(config, "dark", discord.meta.capabilities);
  return (
    <Window>
      <TypecaastStage
        state={engine.getStateAt(engine.durationMs * frac)}
        skin={discord}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/Discord" };
export default meta;
type Story = StoryObj;

export const Complete: Story = {
  name: "Complete",
  render: () => <Frozen frac={1} />,
};

export const Animated: Story = {
  name: "Animated (loop)",
  render: () => (
    <Window>
      <Typecaast config={config} skin={discord} theme="dark" autoplay loop />
    </Window>
  ),
};
