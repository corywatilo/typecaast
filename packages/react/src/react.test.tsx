import { createRef } from "react";
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import type { RenderedMessage } from "@typecaast/core";
import {
  buildMockBillingToastState,
  mockParticipants,
} from "@typecaast/core/mocks";
import { TypecaastStage, type Skin } from "@typecaast/skin-kit";
import { useTypecaast } from "./use-typecaast.js";
import { Typecaast, type TypecaastHandle } from "./typecaast.js";

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

describe("<Typecaast> controlled playback (paused + ref)", () => {
  // The explicit `skin` path renders synchronously (no Suspense), so the ref
  // resolves immediately. jsdom has no rAF, so the clock never ticks on its
  // own — we drive it with the imperative handle and assert `playing`/position.
  const handle = () => {
    const ref = createRef<TypecaastHandle>();
    const view = render(
      <Typecaast
        config={config}
        skin={testSkin}
        theme="light"
        autoplay
        paused
        ref={ref}
      />,
    );
    return { ref, view };
  };

  it("exposes an imperative handle and does not autoplay when paused at mount", () => {
    const { ref } = handle();
    expect(ref.current).toBeTruthy();
    expect(ref.current!.playing).toBe(false); // no autoplay flash
    expect(ref.current!.duration).toBeGreaterThan(0);
    expect(ref.current!.currentMs).toBe(0);
    expect(typeof ref.current!.seek).toBe("function");
  });

  it("resumes from the current position (paused true→false), never restarting", () => {
    const ref = createRef<TypecaastHandle>();
    const props = (paused: boolean) => (
      <Typecaast
        config={config}
        skin={testSkin}
        theme="light"
        paused={paused}
        ref={ref}
      />
    );
    const { rerender } = render(props(false)); // controlled, playing
    act(() => ref.current!.seek(ref.current!.duration / 2));
    const mid = ref.current!.currentMs;
    expect(mid).toBeGreaterThan(0);

    rerender(props(true)); // pause
    expect(ref.current!.playing).toBe(false);
    expect(ref.current!.currentMs).toBe(mid); // frozen in place

    rerender(props(false)); // resume
    expect(ref.current!.playing).toBe(true);
    // Resumed from `mid` (the live clock may advance a hair), not reset to 0.
    expect(ref.current!.currentMs).toBeGreaterThanOrEqual(mid);
    expect(ref.current!.currentMs).toBeLessThan(mid + 100);
  });

  it("jumps to a time and accepts rate/step via the ref", () => {
    const { ref } = handle();
    act(() => ref.current!.seek(1000));
    expect(ref.current!.currentMs).toBe(1000);
    act(() => {
      ref.current!.setRate(2);
      ref.current!.scrubTo(0);
      ref.current!.stepNext();
    });
    expect(ref.current!.currentMs).toBeGreaterThan(0);
  });

  it("fires onPlay / onPause as playback is controlled", () => {
    const ref = createRef<TypecaastHandle>();
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const props = (paused: boolean) => (
      <Typecaast
        config={config}
        skin={testSkin}
        theme="light"
        paused={paused}
        onPlay={onPlay}
        onPause={onPause}
        ref={ref}
      />
    );
    const { rerender } = render(props(true)); // paused at mount → no play yet
    expect(onPlay).not.toHaveBeenCalled();
    rerender(props(false));
    expect(onPlay).toHaveBeenCalled();
    rerender(props(true));
    expect(onPause).toHaveBeenCalled();
  });
});
