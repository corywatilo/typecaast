import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { defineSkin } from "./define-skin.js";
import { loadSkinFonts } from "./fonts.js";
import { ThemeProvider, useTheme } from "./theme.js";
import type { Skin } from "./types.js";

function ThemeProbe(): string {
  return useTheme();
}

describe("theme context (SSR-safe)", () => {
  it("provides the resolved theme to descendants", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider theme="dark">
        <span>{<ThemeProbe />}</span>
      </ThemeProvider>,
    );
    expect(html).toBe("<span>dark</span>");
  });

  it("defaults to light with no provider", () => {
    const html = renderToStaticMarkup(<span>{<ThemeProbe />}</span>);
    expect(html).toBe("<span>light</span>");
  });
});

describe("loadSkinFonts", () => {
  it("is a no-op (resolves) with no document / FontFace", async () => {
    await expect(
      loadSkinFonts([
        { family: "Lato", sources: [{ url: "/fonts/lato.woff2" }] },
      ]),
    ).resolves.toBeUndefined();
  });

  it("resolves immediately for undefined/empty fonts", async () => {
    await expect(loadSkinFonts(undefined)).resolves.toBeUndefined();
    await expect(loadSkinFonts([])).resolves.toBeUndefined();
  });
});

describe("defineSkin", () => {
  it("returns the skin unchanged", () => {
    const stub = (() => null) as unknown as Skin["components"]["Message"];
    const skin: Skin = {
      id: "test",
      meta: {
        name: "Test",
        defaultCanvas: { width: 100, height: 100 },
        supportsThemes: ["light", "dark"],
        capabilities: {
          events: { message: "native", typing: "unsupported" },
          content: { text: true, image: true },
          reactions: true,
          threads: true,
          readReceipts: false,
        },
      },
      components: {
        Frame: stub as unknown as Skin["components"]["Frame"],
        Message: stub,
        TypingIndicator:
          stub as unknown as Skin["components"]["TypingIndicator"],
        Reaction: stub as unknown as Skin["components"]["Reaction"],
        Composer: stub as unknown as Skin["components"]["Composer"],
        SystemMessage: stub as unknown as Skin["components"]["SystemMessage"],
        Avatar: stub as unknown as Skin["components"]["Avatar"],
      },
    };
    expect(defineSkin(skin)).toBe(skin);
  });
});
