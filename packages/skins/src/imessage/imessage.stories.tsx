import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine, type ResolvedTheme } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { TypecaastStage } from "@typecaast/skin-kit";
import { imessage } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 390, height: 844 },
    skin: { id: "imessage", options: { contact: "Sam Carter" } },
  },
  participants: [
    { id: "me", name: "Me", isSelf: true },
    { id: "sam", name: "Sam Carter", color: "#ff7a59" },
  ],
  timeline: [
    {
      type: "message",
      from: "sam",
      text: "running late, maybe 5 min 😅",
      id: "m1",
    },
    { type: "reaction", target: "m1", emoji: "👍", from: "me", delay: 800 },
    { type: "message", from: "me", text: "no worries, grabbing a table now" },
    { type: "typing", from: "sam", showTypingFor: 1600 },
    { type: "message", from: "sam", text: "you're the best, omw 🏃" },
    { type: "composerType", from: "me", text: "see you soon!" },
  ],
});

function Window({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 390,
        height: 760,
        borderRadius: 40,
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
  const engine = createEngine(config, theme, imessage.meta.capabilities);
  return (
    <Window>
      <TypecaastStage
        state={engine.getStateAt(engine.durationMs * frac)}
        skin={imessage}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/iMessage (iOS)" };
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

export const Typing: Story = {
  name: "Light · Typing",
  render: () => <Frozen frac={0.6} theme="light" />,
};
