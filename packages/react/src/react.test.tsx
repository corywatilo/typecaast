import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import type { RenderedMessage } from "@typecaast/core";
import {
  buildMockBillingToastState,
  mockParticipants,
} from "@typecaast/core/mocks";
import { TypecaastStage, type Skin } from "@typecaast/skin-kit";
import { useTypecaast } from "./use-typecaast.js";

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
    defaultCanvas: { width: 100, height: 100 },
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
    Frame: ({ theme, children }) => (
      <div data-testid="frame" data-theme={theme}>
        {children}
      </div>
    ),
    Message: ({ message, author }) => (
      <div data-testid="message" data-id={message.id}>
        {author.name}: {textOf(message)}
      </div>
    ),
    SystemMessage: ({ message }) => (
      <div data-testid="system" data-id={message.id} />
    ),
    TypingIndicator: ({ author }) => (
      <div data-testid="typing">{author.name}</div>
    ),
    Reaction: () => null,
    Composer: ({ composer }) => (
      <div data-testid="composer">{composer.text}</div>
    ),
    Avatar: () => null,
  },
};

// A real config — the engine compiles its timeline (no mock).
const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 880, height: 720 }, skin: { id: "slack" } },
  participants: mockParticipants,
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "reaction", target: "$prev", emoji: "🦔" },
    { type: "typing", from: "paul" },
    { type: "message", from: "paul", text: "shouldn't error" },
    { type: "composerType", from: "cory", text: "Let me check." },
    { type: "send" },
  ],
});

describe("useTypecaast (real engine)", () => {
  it("starts empty and reveals the real config's messages by the end", () => {
    const { result } = renderHook(() =>
      useTypecaast(config, { theme: "light" }),
    );
    expect(result.current.state.messages).toHaveLength(0);
    expect(result.current.duration).toBeGreaterThan(0);

    act(() => result.current.seek(result.current.duration));
    const texts = result.current.state.messages.map(textOf);
    expect(texts.some((t) => t.includes("billing toast error"))).toBe(true);
  });

  it("steps to the next boundary and reveals the first message", () => {
    const { result } = renderHook(() =>
      useTypecaast(config, { theme: "dark" }),
    );
    // First boundary is t=0 (empty); advance past it to the first event.
    act(() => result.current.stepNext());
    act(() => result.current.stepNext());
    expect(result.current.state.messages.length).toBeGreaterThan(0);
    expect(result.current.state.theme).toBe("dark");
  });
});

describe("TypecaastStage", () => {
  it("renders messages, a system card, and the composer from state", () => {
    const state = buildMockBillingToastState(9800, "dark");
    render(
      <TypecaastStage
        state={state}
        skin={testSkin}
        participants={mockParticipants}
      />,
    );
    expect(screen.getByTestId("frame").getAttribute("data-theme")).toBe("dark");
    expect(screen.getAllByTestId("message").length).toBeGreaterThan(0);
    expect(screen.getByTestId("system")).toBeTruthy();
    expect(screen.getByTestId("composer").textContent?.length).toBeGreaterThan(
      0,
    );
  });

  it("shows a typing indicator while Paul is typing", () => {
    render(
      <TypecaastStage
        state={buildMockBillingToastState(3000)}
        skin={testSkin}
        participants={mockParticipants}
      />,
    );
    expect(screen.getByTestId("typing").textContent).toContain("Paul");
  });
});
