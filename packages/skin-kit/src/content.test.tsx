import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { toContentNodes, type ContentNode } from "@typecaast/schema";
import { MessageContent } from "./content.js";

const html = (nodes: ContentNode[]) =>
  renderToStaticMarkup(<MessageContent nodes={nodes} />);

describe("MessageContent", () => {
  it("renders text with inline marks", () => {
    const out = html(
      toContentNodes({ text: "hey @paul see `x` at https://posthog.com" }),
    );
    expect(out).toContain('data-tc-mark="mention"');
    expect(out).toContain("@paul");
    expect(out).toContain("<code");
    expect(out).toContain('href="https://posthog.com"');
  });

  it("renders an in-message image with src/alt/width", () => {
    const out = html(
      toContentNodes({
        text: "here's the toast:",
        images: [
          { src: "./toast.png", alt: "billing error toast", width: 320 },
        ],
      }),
    );
    expect(out).toContain('data-tc-node="image"');
    expect(out).toContain('src="./toast.png"');
    expect(out).toContain('alt="billing error toast"');
    expect(out).toContain('width="320"');
  });

  it("skips unknown node types", () => {
    const out = html([
      { type: "text", spans: [{ type: "text", value: "ok" }] },
      {
        type: "linkPreview",
        url: "https://example.com",
      } as unknown as ContentNode,
    ]);
    expect(out).toContain("ok");
    expect(out).not.toContain("example.com");
  });
});
