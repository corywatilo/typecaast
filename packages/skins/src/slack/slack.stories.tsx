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
      type: "message",
      from: "posthog-bot",
      content: [
        { type: "section", text: "Pull request opened." },
        {
          type: "actions",
          elements: [
            { type: "button", label: "View PR", style: "primary" },
            { type: "button", label: "Open in PostHog Code" },
          ],
        },
      ],
    },
    {
      type: "composerType",
      from: "cory",
      text: "Let me check how exceptions are captured in the frontend.",
    },
    { type: "send" },
  ],
});

/**
 * A PostHog "Signals" app thread built purely from Block Kit blocks — a header,
 * grey context lines (emoji + mentions), a section body, and an action row, with
 * two follow-up app messages (rendered inline in the channel, no thread panel).
 */
const signalsConfig: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 480, height: 760 },
    skin: { id: "slack", options: { channel: "#signals" } },
    composer: "always",
  },
  participants: [
    { id: "posthog", name: "PostHog", kind: "app" },
    { id: "joe", name: "Joe Saunderson" },
    { id: "cory", name: "Cory Watilo" },
  ],
  timeline: [
    {
      type: "message",
      from: "posthog",
      instant: true,
      content: [
        {
          type: "header",
          text: "perf(inbox): Fix 26s admin inbox load from unbounded contact scan",
        },
        {
          type: "context",
          elements: [
            {
              type: "text",
              text: "🟠 *P2* · Session replay · rvenvy/rvenvy-ai",
            },
          ],
        },
        {
          type: "section",
          text: "Sales reps and admins hit prolonged loading spinners that block content from appearing, with the worst case taking 26 seconds before the CRM inbox rendered.",
        },
        {
          type: "context",
          elements: [
            {
              type: "text",
              text: "2 signals · 👤 Suggested reviewers: <@joe> <@cory>",
            },
          ],
        },
        {
          type: "actions",
          elements: [
            { type: "button", label: "Review PR", href: "https://example.com" },
            { type: "button", label: "Open in PostHog" },
            { type: "button", label: "Dismiss", style: "danger" },
          ],
        },
      ],
    },
    {
      type: "message",
      from: "posthog",
      content: [
        {
          type: "context",
          elements: [
            { type: "text", text: "*Session replay* · Session problem" },
          ],
        },
        {
          type: "section",
          text: 'The user searched for "Travel trailers with front living" floorplans, browsed results, then clicked a listing which resulted in a prolonged loading state with a skeleton screen.',
        },
        {
          type: "context",
          elements: [{ type: "text", text: "Problem: blocking exception" }],
        },
      ],
    },
    {
      type: "message",
      from: "posthog",
      content: [
        {
          type: "context",
          elements: [
            { type: "text", text: "*Session replay* · Session problem" },
          ],
        },
        {
          type: "section",
          text: "While attempting to navigate from an inventory listing to its photos and then to the Inbox, the user encountered prolonged loading screens that prevented content from appearing.",
        },
        {
          type: "context",
          elements: [{ type: "text", text: "Problem: blocking exception" }],
        },
      ],
    },
  ],
});

/**
 * A retention analysis posted by the PostHog app — bold-rich sections plus a
 * **multi-line code block** holding a monospaced metrics table. Authored on a
 * wide canvas so the table stays one line per row (the host page scales it down
 * with `fit: "scale"`). Initials avatars keep the visual baseline deterministic.
 */
const codeBlockConfig: Config = configSchema.parse({
  version: 1,
  meta: {
    canvas: { width: 730, height: 620 },
    fit: "scale",
    skin: { id: "slack", options: { channel: "#growth" } },
    composer: "always",
  },
  participants: [
    { id: "paul", name: "Paul D'Ambra", color: "#5b3a8e" },
    { id: "posthog", name: "PostHog", kind: "app" },
  ],
  timeline: [
    {
      type: "message",
      from: "paul",
      instant: true,
      text: "<@posthog> is there a difference in retention of users or orgs that are using insight or dashboard subscriptions. are they more likely to visit posthog or to create further insights or try other products",
    },
    {
      type: "reaction",
      target: "$prev",
      emoji: "👀",
      shortcode: "eyes",
      from: "posthog",
    },
    {
      type: "message",
      from: "posthog",
      instant: true,
      content: [
        {
          type: "section",
          spans: [
            { type: "text", value: "Subscription orgs are ~" },
            { type: "bold", value: "1.5× more likely to return" },
            { type: "text", value: ", stay active ~" },
            { type: "bold", value: "2.5× as many weeks" },
            { type: "text", value: ", create ~" },
            {
              type: "bold",
              value: "3× more often / ~11× the volume of insights",
            },
            { type: "text", value: ", and touch ~" },
            { type: "bold", value: "3× as many products" },
            { type: "text", value: "." },
          ],
        },
        { type: "section", text: "*Setup*" },
        {
          type: "section",
          text: "I looked at all orgs active on PostHog in *March 2026* (≥1 app pageview, ~118.7k orgs), split by whether they'd created an *insight or dashboard subscription* by then (2,162 orgs had; 116,527 hadn't), then measured their behaviour over the *following 8 weeks (Apr–May 2026)*. Unit = organization (",
        },
        { type: "section", text: "*Headline comparison (Apr–May behaviour)*" },
        {
          type: "codeblock",
          text: "Metric                          No subscription (116.5k)   Has subscription (2.2k)\nCame back at all                64%                        96%\nAvg active weeks (of ~8)        2.9                        7.2\nCreated ≥1 new insight          20%                        67%\nAvg insights created            4.7                        51.8\nDistinct other products touched 0.6                        1.9",
        },
      ],
    },
  ],
});

/** A framed "window" so the skin reads like a real surface. */
function Window({
  theme,
  children,
  width = 480,
  height = 720,
}: {
  theme: ResolvedTheme;
  children: ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
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
function Frozen({
  frac,
  theme,
  cfg = config,
  width,
  height,
}: {
  frac: number;
  theme: ResolvedTheme;
  cfg?: Config;
  width?: number;
  height?: number;
}) {
  const engine = createEngine(cfg, theme, slack.meta.capabilities);
  const state = engine.getStateAt(engine.durationMs * frac);
  return (
    <Window theme={theme} width={width} height={height}>
      <TypecaastStage
        state={state}
        skin={slack}
        participants={cfg.participants}
        options={cfg.meta.skin.options}
        composer={cfg.meta.composer}
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

export const BlockKitLight: Story = {
  name: "Block Kit · Light",
  render: () => <Frozen frac={1} theme="light" cfg={signalsConfig} />,
};

export const BlockKitDark: Story = {
  name: "Block Kit · Dark",
  render: () => <Frozen frac={1} theme="dark" cfg={signalsConfig} />,
};

export const CodeBlockLight: Story = {
  name: "Code Block · Light",
  render: () => (
    <Frozen
      frac={1}
      theme="light"
      cfg={codeBlockConfig}
      width={730}
      height={620}
    />
  ),
};

export const CodeBlockDark: Story = {
  name: "Code Block · Dark",
  render: () => (
    <Frozen
      frac={1}
      theme="dark"
      cfg={codeBlockConfig}
      width={730}
      height={620}
    />
  ),
};
