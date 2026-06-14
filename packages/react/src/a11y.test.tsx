import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import type { RenderedMessage } from "@typecaast/core";
import { mockParticipants } from "@typecaast/core/mocks";
import type { Skin } from "@typecaast/skin-kit";
import { Typecaast } from "./typecaast.js";
import { buildTranscript } from "./transcript.js";

afterEach(cleanup);

function textOf(message: RenderedMessage): string {
  return message.content
    .flatMap((node) =>
      node.type === "text"
        ? (node as { spans: { value?: string }[] }).spans.map(
            (s) => s.value ?? "",
          )
        : [],
    )
    .join("");
}

const testSkin: Skin = {
  id: "test",
  meta: {
    name: "Test",
    defaultCanvas: { width: 480, height: 720 },
    supportsThemes: ["light", "dark"],
    capabilities: {
      events: {},
      content: {},
      reactions: true,
      threads: true,
      readReceipts: false,
    },
  },
  components: {
    Frame: ({ children }) => <div>{children}</div>,
    Message: ({ message, author }) => (
      <div>
        {author.name}: {textOf(message)}
      </div>
    ),
    SystemMessage: () => <div />,
    TypingIndicator: () => <div />,
    Reaction: () => null,
    Composer: ({ composer }) => <div>{composer.text}</div>,
    Avatar: () => null,
  },
};

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: mockParticipants,
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "message", from: "paul", text: "shouldn't error" },
    { type: "composerType", from: "cory", text: "let me check" },
    { type: "send" },
  ],
});

describe("Typecaast accessibility", () => {
  it("exposes a figure role, label, and a screen-reader transcript", () => {
    render(
      <Typecaast
        config={config}
        skin={testSkin}
        theme="light"
        label="Billing chat"
      />,
    );
    const fig = screen.getByRole("figure", { name: "Billing chat" });
    expect(fig).toBeTruthy();
    // The transcript (sr-only list) carries the conversation text.
    expect(fig.textContent).toContain("i got a billing toast error?");
    expect(fig.textContent).toContain("let me check");
  });

  it("buildTranscript names each speaker", () => {
    const lines = buildTranscript(config);
    expect(lines[0]).toEqual({
      name: "Cory Watilo",
      text: "i got a billing toast error?",
    });
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Typecaast config={config} skin={testSkin} theme="light" />,
    );
    // Disable color-contrast: jsdom has no layout/computed colors.
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
