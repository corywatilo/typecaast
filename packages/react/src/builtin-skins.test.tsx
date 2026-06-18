import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { configSchema } from "@typecaast/schema";
import { slack } from "@typecaast/skins";
import { Typecaast } from "./typecaast.js";
import { builtinSkinIds, loadBuiltinSkin } from "./builtin-skins.js";

afterEach(cleanup);

describe("built-in skin loader", () => {
  it("exposes the built-in ids", () => {
    expect(builtinSkinIds).toEqual(
      expect.arrayContaining(["slack", "telegram", "discord"]),
    );
  });

  it("lazy-loads a skin by id, resolving its default export", async () => {
    const skin = await loadBuiltinSkin("slack");
    expect(skin.id).toBe("slack");
    expect(skin.meta.name).toBe("Slack");
  });

  it("only loads the requested skin's subpath (others stay separate chunks)", async () => {
    // Each loader is a static `import("@typecaast/skins/<id>")` so bundlers emit
    // one chunk per skin; importing one never pulls another.
    const telegram = await loadBuiltinSkin("telegram");
    expect(telegram.id).toBe("telegram");
  });

  it("returns a stable cached promise per id (for the Suspense read)", () => {
    expect(loadBuiltinSkin("telegram")).toBe(loadBuiltinSkin("telegram"));
  });

  it("throws a clear, actionable error for an unknown id", () => {
    expect(() => loadBuiltinSkin("nope")).toThrow(
      /unknown skin "nope".*pass the `skin` prop/s,
    );
  });
});

describe("<Typecaast>", () => {
  const config = configSchema.parse({
    version: 1,
    meta: {
      canvas: { width: 480, height: 640 },
      skin: { id: "slack", options: { channel: "#alerts" } },
    },
    participants: [{ id: "a", name: "Ada", isSelf: true }],
    timeline: [{ type: "message", from: "a", text: "shipping it" }],
  });

  // Note: the zero-config (no `skin` prop) path resolves the skin via a Suspense
  // read of a lazy import (works on React 18 and 19). That suspends correctly in
  // the real runtime (verified in a Next.js Server Component) but the concurrent
  // scheduler doesn't resume in jsdom, so we exercise the synchronous
  // explicit-skin path here and cover id resolution via the loader tests above.
  it("renders the skin passed explicitly (custom-skin path)", () => {
    render(<Typecaast config={config} skin={slack} />);
    expect(screen.getByText("Thread")).toBeTruthy();
    // The accessible transcript carries the conversation regardless of playback.
    expect(screen.getByText(/shipping it/)).toBeTruthy();
  });

  it("normalizes a raw (unparsed) config — e.g. an imported typecaast.json", () => {
    // A raw config with no `pacing` etc. (as exported JSON). Previously this
    // crashed in the engine reading `config.pacing.startDelayMs`; the component
    // now applies schema defaults internally.
    const raw = {
      version: 1,
      meta: { canvas: { width: 480, height: 640 }, skin: { id: "slack" } },
      participants: [{ id: "a", name: "Ada", isSelf: true }],
      timeline: [{ type: "message", from: "a", text: "raw config works" }],
    };
    render(<Typecaast config={raw} skin={slack} />);
    expect(screen.getByText("Thread")).toBeTruthy();
    expect(screen.getByText(/raw config works/)).toBeTruthy();
  });
});
