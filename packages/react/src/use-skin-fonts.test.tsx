import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Skin } from "@typecaast/skin-kit";

import { useSkinFonts } from "./use-skin-fonts.js";

function skinWith(fonts: Skin["meta"]["fonts"]): Skin {
  const stub = (() => null) as unknown as Skin["components"]["Message"];
  return {
    id: "test",
    meta: {
      name: "Test",
      defaultCanvas: { width: 1, height: 1 },
      supportsThemes: ["light"],
      capabilities: {
        events: {},
        content: {},
        reactions: false,
        threads: false,
        readReceipts: false,
      },
      fonts,
    },
    components: {
      Frame: stub as unknown as Skin["components"]["Frame"],
      Message: stub,
      TypingIndicator: stub as unknown as Skin["components"]["TypingIndicator"],
      Reaction: stub as unknown as Skin["components"]["Reaction"],
      Composer: stub as unknown as Skin["components"]["Composer"],
      SystemMessage: stub as unknown as Skin["components"]["SystemMessage"],
      Avatar: stub as unknown as Skin["components"]["Avatar"],
    },
  };
}

describe("useSkinFonts", () => {
  it("is loaded immediately when the skin declares no fonts", () => {
    const { result } = renderHook(() => useSkinFonts(skinWith(undefined)));
    expect(result.current).toBe("loaded");
  });

  it("settles to loaded after attempting to load declared fonts", async () => {
    const { result } = renderHook(() =>
      useSkinFonts(
        skinWith([{ family: "Lato", sources: [{ url: "/lato.woff2" }] }]),
      ),
    );
    // No FontFace in jsdom → loadSkinFonts resolves immediately.
    await waitFor(() => expect(result.current).toBe("loaded"));
  });
});
