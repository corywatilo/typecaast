import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine, type ResolvedTheme } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { Typecaast, TypecaastStage } from "@typecaast/react";
import { whatsapp } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 390, height: 720 },
    skin: { id: "whatsapp", options: { contact: "Mum", status: "online" } },
  },
  participants: [
    { id: "me", name: "Me", isSelf: true },
    { id: "mum", name: "Mum", color: "#7e57c2" },
  ],
  timeline: [
    { type: "message", from: "mum", text: "call me when you can ❤️", id: "m1" },
    { type: "reaction", target: "m1", emoji: "❤️", from: "me", delay: 700 },
    {
      type: "message",
      from: "me",
      text: "will do — just leaving the office now",
    },
    { type: "typing", from: "mum", showTypingFor: 1400 },
    { type: "message", from: "mum", text: "drive safe! 🚗" },
    { type: "composerType", from: "me", text: "see you in 20" },
  ],
});

function Window({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 390,
        height: 720,
        borderRadius: 36,
        overflow: "hidden",
        border: "10px solid #1a1a1a",
        boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}

function Frozen({ frac, theme }: { frac: number; theme: ResolvedTheme }) {
  const engine = createEngine(config, theme, whatsapp.meta.capabilities);
  return (
    <Window>
      <TypecaastStage
        state={engine.getStateAt(engine.durationMs * frac)}
        skin={whatsapp}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/WhatsApp" };
export default meta;
type Story = StoryObj;

export const LightComplete: Story = {
  name: "Light · Complete",
  render: () => <Frozen frac={1} theme="light" />,
};

export const DarkComplete: Story = {
  name: "Dark · Complete",
  render: () => <Frozen frac={1} theme="dark" />,
};

export const Animated: Story = {
  name: "Animated · Light (loop)",
  render: () => (
    <Window>
      <Typecaast config={config} skin={whatsapp} theme="light" autoplay loop />
    </Window>
  ),
};

export const AnimatedDark: Story = {
  name: "Animated · Dark (loop)",
  render: () => (
    <Window>
      <Typecaast config={config} skin={whatsapp} theme="dark" autoplay loop />
    </Window>
  ),
};
