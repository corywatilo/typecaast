import type { FC, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { configSchema, type Config, type Participant } from "@typecaast/schema";
import { createEngine } from "@typecaast/core";
import type { FrameProps, MessageProps } from "@typecaast/core";
import { defineSkin, fadeSlideIn, MessageContent } from "@typecaast/skin-kit";

/**
 * M3a.E — a third party authors a skin following ONLY docs/authoring-skins.md.
 * This is the minimal skin from that guide, verbatim, proving the contract +
 * docs are sufficient to build a working skin with no contract changes.
 */

const Frame: FC<FrameProps & { children?: ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: "system-ui", background: "#fff", height: "100%" }}>
    {children}
  </div>
);

const Message: FC<MessageProps> = ({ message }) => (
  <div style={{ padding: "4px 12px", ...fadeSlideIn(message.revealProgress) }}>
    <MessageContent nodes={message.content} />
  </div>
);

const noop = () => null;

const bare = defineSkin({
  id: "bare",
  meta: {
    name: "Bare",
    defaultCanvas: { width: 480, height: 640 },
    supportsThemes: ["light"],
    capabilities: {
      events: { message: "native" },
      content: { text: true, image: true },
      reactions: false,
      threads: false,
      readReceipts: false,
    },
  },
  components: {
    Frame,
    Message,
    SystemMessage: noop,
    TypingIndicator: noop,
    Reaction: noop,
    Composer: noop,
    Avatar: noop,
  },
});

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 480, height: 640 }, skin: { id: "bare" } },
  participants: [{ id: "a", name: "A", isSelf: true }],
  timeline: [
    { type: "message", from: "a", text: "hello from a from-docs skin" },
  ],
});

describe("authoring a skin from the docs", () => {
  it("the minimal example skin compiles and renders engine state", () => {
    const engine = createEngine(config, "light", bare.meta.capabilities);
    const state = engine.getStateAt(engine.durationMs);
    const author = new Map<string, Participant>(
      config.participants.map((p) => [p.id, p]),
    );
    const { Frame: F, Message: M } = bare.components;
    const html = renderToStaticMarkup(
      <F theme="light">
        {state.messages.map((m) => (
          <M
            key={m.id}
            theme="light"
            message={m}
            author={author.get(m.from)!}
          />
        ))}
      </F>,
    );
    expect(html).toContain("hello from a from-docs skin");
  });
});
