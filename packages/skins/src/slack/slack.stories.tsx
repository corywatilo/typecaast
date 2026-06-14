import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { ResolvedTheme } from "@typecaast/core";
import {
  buildMockBillingToastState,
  mockParticipants,
  MOCK_BILLING_TOAST_DURATION_MS,
} from "@typecaast/core/mocks";
import { configSchema, type Config } from "@typecaast/schema";
import { Typecaast, TypecaastStage } from "@typecaast/react";
import { slack } from "./index.js";

/** A framed "window" so the skin reads like a real surface in the gallery. */
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

function Frozen({ t, theme }: { t: number; theme: ResolvedTheme }) {
  return (
    <Window theme={theme}>
      <TypecaastStage
        state={buildMockBillingToastState(t, theme)}
        skin={slack}
        participants={mockParticipants}
        options={{ channel: "#alerts" }}
      />
    </Window>
  );
}

const animatedConfig: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 480, height: 720 },
    skin: { id: "slack", options: { channel: "#alerts" } },
  },
  participants: mockParticipants,
  timeline: [{ type: "message", from: "cory", text: "placeholder" }],
});

const meta: Meta = {
  title: "Skins/Slack",
};
export default meta;

type Story = StoryObj;

export const LightComplete: Story = {
  name: "Light · Complete",
  render: () => <Frozen t={MOCK_BILLING_TOAST_DURATION_MS} theme="light" />,
};

export const DarkComplete: Story = {
  name: "Dark · Complete",
  render: () => <Frozen t={MOCK_BILLING_TOAST_DURATION_MS} theme="dark" />,
};

export const PaulTyping: Story = {
  name: "Light · Paul typing",
  render: () => <Frozen t={3000} theme="light" />,
};

export const SystemCard: Story = {
  name: "Dark · PR system card",
  render: () => <Frozen t={7800} theme="dark" />,
};

export const ComposerTyping: Story = {
  name: "Light · Composer typing",
  render: () => <Frozen t={9800} theme="light" />,
};

export const Animated: Story = {
  name: "Animated · Light (loop)",
  render: () => (
    <Window theme="light">
      <Typecaast
        config={animatedConfig}
        skin={slack}
        theme="light"
        autoplay
        loop
      />
    </Window>
  ),
};

export const AnimatedDark: Story = {
  name: "Animated · Dark (loop)",
  render: () => (
    <Window theme="dark">
      <Typecaast
        config={animatedConfig}
        skin={slack}
        theme="dark"
        autoplay
        loop
      />
    </Window>
  ),
};
