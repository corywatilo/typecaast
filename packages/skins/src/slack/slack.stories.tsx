import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { createEngine, type ResolvedTheme } from "@typecaast/core";
import { configSchema, type Config } from "@typecaast/schema";
import { TypecaastStage } from "@typecaast/skin-kit";
import { slack } from "./index.js";

/** The real billing-toast thread — compiled by the engine (no mock). */
const config: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 480, height: 720 },
    skin: { id: "slack", options: { channel: "#alerts" } },
  },
  participants: [
    { id: "cory", name: "Cory Watilo", isSelf: true },
    { id: "paul", name: "Paul D'Ambra", color: "#5b3a8e" },
    { id: "posthog-bot", name: "PostHog", kind: "app" },
  ],
  timeline: [
    {
      type: "message",
      from: "cory",
      text: "i got a billing toast error on the dashboard but i think it's a bug?",
    },
    { type: "reaction", target: "$prev", emoji: "🦔", delay: 1200 },
    { type: "typing", from: "paul", showTypingFor: 1800 },
    {
      type: "message",
      from: "paul",
      text: "@PostHog the billing/spend API call shouldn't show an error toast to the user…",
    },
    {
      type: "system",
      from: "posthog-bot",
      card: "pr-opened",
      text: "Pull request opened.",
      actions: [{ label: "View PR" }, { label: "Open in PostHog Code" }],
    },
    {
      type: "composerType",
      from: "cory",
      text: "Let me check how exceptions are captured in the frontend.",
    },
    { type: "send" },
  ],
});

/** A framed "window" so the skin reads like a real surface. */
function Window({
  theme,
  children,
}: {
  theme: ResolvedTheme;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: 480,
        height: 720,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.12)",
        boxShadow:
          theme === "dark"
            ? "0 12px 40px rgba(0,0,0,0.5)"
            : "0 12px 40px rgba(0,0,0,0.16)",
        display: "flex",
      }}
    >
      {children}
    </div>
  );
}

/** A deterministic frame from the REAL engine at a fraction of the duration. */
function Frozen({ frac, theme }: { frac: number; theme: ResolvedTheme }) {
  const engine = createEngine(config, theme, slack.meta.capabilities);
  const state = engine.getStateAt(engine.durationMs * frac);
  return (
    <Window theme={theme}>
      <TypecaastStage
        state={state}
        skin={slack}
        participants={config.participants}
        options={config.meta.skin.options}
      />
    </Window>
  );
}

const meta: Meta = { title: "Skins/Slack" };
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

export const MidThread: Story = {
  name: "Light · Mid-thread",
  render: () => <Frozen frac={0.55} theme="light" />,
};

export const DarkMidThread: Story = {
  name: "Dark · Mid-thread",
  render: () => <Frozen frac={0.55} theme="dark" />,
};
