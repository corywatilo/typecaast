import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine, type ResolvedTheme } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { Typecaast, TypecaastStage } from "@typecaast/react";
import { cursor } from "./index.js";

const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 400, height: 600 },
    skin: { id: "cursor", options: { title: "Chat" } },
  },
  participants: [
    { id: "me", name: "You", isSelf: true },
    { id: "ai", name: "Cursor", kind: "app" },
  ],
  timeline: [
    {
      type: "composerType",
      from: "me",
      text: "add a dark mode toggle to the header",
    },
    { type: "send" },
    { type: "typing", from: "ai", showTypingFor: 1500 },
    {
      type: "message",
      from: "ai",
      text: "I'll add a `useTheme` hook and wire a toggle into the `Header` component.",
    },
    { type: "system", from: "ai", card: "tool", text: "Edited src/Header.tsx" },
    {
      type: "message",
      from: "ai",
      text: "Done. The toggle persists to `localStorage` and respects `prefers-color-scheme`.",
    },
    { type: "composerType", from: "me", text: "nice, run the tests" },
  ],
});

function Window({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 400,
        height: 600,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}

function Frozen({ frac, theme }: { frac: number; theme: ResolvedTheme }) {
  const engine = createEngine(config, theme, cursor.meta.capabilities);
  return (
    <Window>
      <TypecaastStage
        state={engine.getStateAt(engine.durationMs * frac)}
        skin={cursor}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/Cursor panel" };
export default meta;
type Story = StoryObj;

export const DarkComplete: Story = {
  name: "Dark · Complete",
  render: () => <Frozen frac={1} theme="dark" />,
};

export const LightComplete: Story = {
  name: "Light · Complete",
  render: () => <Frozen frac={1} theme="light" />,
};

export const Animated: Story = {
  name: "Animated · Dark (loop)",
  render: () => (
    <Window>
      <Typecaast config={config} skin={cursor} theme="dark" autoplay loop />
    </Window>
  ),
};
