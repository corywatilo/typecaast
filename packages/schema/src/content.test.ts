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
    const explicit = [{ type: "text" as const, spans: [] }];
    // Explicit content is authoritative (text sugar ignored); it's normalized,
    // so a deep-equal array comes back.
    expect(toContentNodes({ text: "ignored", content: explicit })).toEqual(
      explicit,
    );
  });
});

describe("content registry & schema", () => {
  it("knows the built-in node types (text/image + Block Kit blocks)", () => {
    expect(knownContentNodeTypes()).toEqual([
      "text",
      "image",
      "header",
      "section",
      "context",
      "divider",
      "actions",
      "attachment",
    ]);
    expect(isKnownContentNodeType("text")).toBe(true);
    expect(isKnownContentNodeType("attachment")).toBe(true);
    expect(isKnownContentNodeType("linkPreview")).toBe(false);
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

describe("parseInline — mrkdwn emphasis & mentions", () => {
  it("extracts bold, italic, and strike", () => {
    expect(parseInline("a *b* _c_ ~d~ e")).toEqual([
      { type: "text", value: "a " },
      { type: "bold", value: "b" },
      { type: "text", value: " " },
      { type: "italic", value: "c" },
      { type: "text", value: " " },
      { type: "strike", value: "d" },
      { type: "text", value: " e" },
    ]);
  });

  it("leaves snake_case and underscored URLs alone", () => {
    expect(parseInline("file_name_here")).toEqual([
      { type: "text", value: "file_name_here" },
    ]);
    expect(parseInline("https://x.com/a_b_c")).toEqual([
      { type: "link", href: "https://x.com/a_b_c" },
    ]);
  });

  it("does not emphasize across leading/trailing spaces", () => {
    expect(parseInline("2 * 3 * 4")).toEqual([
      { type: "text", value: "2 * 3 * 4" },
    ]);
  });

  it("resolves a `<@id>` mention to an id + placeholder label", () => {
    expect(parseInline("ping <@cory> now")).toEqual([
      { type: "text", value: "ping " },
      { type: "mention", id: "cory", label: "@cory" },
      { type: "text", value: " now" },
    ]);
  });
});

describe("Block Kit content nodes", () => {
  it("normalizes block `text` sugar to spans (incl. nested attachment)", () => {
    const nodes = toContentNodes({
      content: [
        { type: "header", text: "Title" },
        { type: "section", text: "Sales *reps* hit <@joe>" },
        {
          type: "context",
          elements: [{ type: "text", text: "🟠 P2 · _replay_" }],
        },
        { type: "divider" },
        {
          type: "attachment",
          color: "#36a64f",
          content: [{ type: "section", text: "nested `code`" }],
        },
      ],
    });
    expect(nodes).toEqual([
      { type: "header", text: "Title" },
      {
        type: "section",
        spans: [
          { type: "text", value: "Sales " },
          { type: "bold", value: "reps" },
          { type: "text", value: " hit " },
          { type: "mention", id: "joe", label: "@joe" },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "text",
            spans: [
              { type: "text", value: "🟠 P2 · " },
              { type: "italic", value: "replay" },
            ],
          },
        ],
      },
      { type: "divider" },
      {
        type: "attachment",
        color: "#36a64f",
        content: [
          {
            type: "section",
            spans: [
              { type: "text", value: "nested " },
              { type: "code", value: "code" },
            ],
          },
        ],
      },
    ]);
  });

  it("validates header/section/context/divider/actions/attachment", () => {
    expect(() =>
      contentSchema.parse([
        { type: "header", text: "perf(inbox): Fix 26s load" },
        {
          type: "section",
          spans: [{ type: "text", value: "body" }],
          accessory: { type: "button", label: "Open", href: "https://x.com" },
        },
        {
          type: "context",
          elements: [
            { type: "image", src: "i.png", alt: "icon" },
            { type: "text", spans: [{ type: "text", value: "2 signals" }] },
          ],
        },
        { type: "divider" },
        {
          type: "actions",
          elements: [
            { type: "button", label: "Review PR", style: "primary" },
            { type: "button", label: "Dismiss", style: "danger" },
            { type: "button", label: "Open in PostHog" },
          ],
        },
        {
          type: "attachment",
          color: "#36a64f",
          content: [{ type: "section", spans: [] }],
        },
      ]),
    ).not.toThrow();
  });

  it("rejects an unknown button style", () => {
    expect(() =>
      contentNodeSchema.parse({
        type: "actions",
        elements: [{ type: "button", label: "x", style: "warning" }],
      }),
    ).toThrow();
  });
});
