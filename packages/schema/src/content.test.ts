import { describe, expect, it } from "vitest";
import {
  contentNodeSchema,
  contentSchema,
  isKnownContentNodeType,
  knownContentNodeTypes,
} from "./content-registry.js";
import {
  parseInline,
  textToContentNode,
  toContentNodes,
} from "./content-sugar.js";

describe("parseInline", () => {
  it("returns an empty array for empty text", () => {
    expect(parseInline("")).toEqual([]);
  });

  it("returns a single text run when there are no marks", () => {
    expect(parseInline("just words")).toEqual([
      { type: "text", value: "just words" },
    ]);
  });

  it("extracts inline code, links, and mentions with surrounding text", () => {
    const spans = parseInline(
      "hey @PostHog see `useState` at https://posthog.com ok",
    );
    expect(spans).toEqual([
      { type: "text", value: "hey " },
      { type: "mention", label: "@PostHog" },
      { type: "text", value: " see " },
      { type: "code", value: "useState" },
      { type: "text", value: " at " },
      { type: "link", href: "https://posthog.com" },
      { type: "text", value: " ok" },
    ]);
  });

  it("handles a mark at the very start", () => {
    expect(parseInline("@cory hi")).toEqual([
      { type: "mention", label: "@cory" },
      { type: "text", value: " hi" },
    ]);
  });
});

describe("toContentNodes", () => {
  it("builds a text node then image nodes, in order", () => {
    const nodes = toContentNodes({
      text: "here's the toast:",
      images: [{ src: "./toast.png", alt: "billing error toast", width: 320 }],
    });
    expect(nodes).toEqual([
      { type: "text", spans: [{ type: "text", value: "here's the toast:" }] },
      {
        type: "image",
        src: "./toast.png",
        alt: "billing error toast",
        width: 320,
      },
    ]);
  });

  it("omits an empty text node", () => {
    const nodes = toContentNodes({ text: "", images: [{ src: "a.png" }] });
    expect(nodes).toEqual([{ type: "image", src: "a.png" }]);
  });

  it("lets explicit content win over sugar", () => {
    const explicit = [{ type: "text", spans: [] }];
    expect(toContentNodes({ text: "ignored", content: explicit })).toBe(
      explicit,
    );
  });
});

describe("content registry & schema", () => {
  it("knows text and image as built-in types", () => {
    expect(knownContentNodeTypes()).toEqual(["text", "image"]);
    expect(isKnownContentNodeType("text")).toBe(true);
    expect(isKnownContentNodeType("attachment")).toBe(false);
  });

  it("validates a well-formed text node and image node", () => {
    expect(() =>
      contentSchema.parse([
        textToContentNode("hi @paul"),
        { type: "image", src: "x.png" },
      ]),
    ).not.toThrow();
  });

  it("accepts an unknown node type leniently", () => {
    const node = contentNodeSchema.parse({
      type: "linkPreview",
      url: "https://example.com",
    });
    expect(node).toMatchObject({ type: "linkPreview" });
  });

  it("rejects a malformed node for a registered type", () => {
    // `text` is registered, so it must have `spans` — no lenient passthrough.
    expect(() => contentNodeSchema.parse({ type: "text" })).toThrow();
    expect(() =>
      contentNodeSchema.parse({ type: "image", src: 123 }),
    ).toThrow();
  });
});
