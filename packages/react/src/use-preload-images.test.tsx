import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema } from "@typecaast/schema";
import { usePreloadImages } from "./use-preload-images.js";

// Capture every URL assigned to a (stubbed) Image so we can assert what got
// preloaded without hitting the network. Unique URLs per assertion sidestep the
// hook's module-level dedupe cache.
const assigned: string[] = [];
class FakeImage {
  decoding = "auto";
  private _src = "";
  set src(v: string) {
    this._src = v;
    assigned.push(v);
  }
  get src(): string {
    return this._src;
  }
  decode(): Promise<void> {
    return Promise.resolve();
  }
}

const realImage = globalThis.Image;
afterEach(() => {
  globalThis.Image = realImage;
  assigned.length = 0;
});

describe("usePreloadImages", () => {
  it("preloads participant avatars and in-message images on mount", () => {
    globalThis.Image = FakeImage as unknown as typeof Image;
    const config = configSchema.parse({
      version: 1,
      meta: { canvas: { width: 100, height: 100 }, skin: { id: "slack" } },
      participants: [
        {
          id: "a",
          name: "A",
          isSelf: true,
          avatar: "https://example.test/preload-avatar-a.png",
        },
        {
          id: "b",
          name: "B",
          avatar: "https://example.test/preload-avatar-b.png",
        },
      ],
      timeline: [
        {
          type: "message",
          from: "b",
          text: "hi",
          images: [{ src: "https://example.test/preload-inmsg.png" }],
        },
      ],
    });

    renderHook(() => usePreloadImages(config));

    expect(assigned).toContain("https://example.test/preload-avatar-a.png");
    expect(assigned).toContain("https://example.test/preload-avatar-b.png");
    expect(assigned).toContain("https://example.test/preload-inmsg.png");
  });

  it("is a no-op for a config with no images", () => {
    globalThis.Image = FakeImage as unknown as typeof Image;
    const config = configSchema.parse({
      version: 1,
      meta: { canvas: { width: 100, height: 100 }, skin: { id: "slack" } },
      participants: [{ id: "a", name: "A", isSelf: true }],
      timeline: [{ type: "message", from: "a", text: "hi" }],
    });

    renderHook(() => usePreloadImages(config));

    expect(assigned).toHaveLength(0);
  });
});
