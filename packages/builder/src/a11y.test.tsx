import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, describe, expect, it } from "vitest";
import type { ConfigInput } from "@typecaast/schema";
import { mockParticipants } from "@typecaast/core/mocks";
import { slack } from "@typecaast/skins";
import { Builder } from "./Builder.js";

afterEach(cleanup);

const config: ConfigInput = {
  version: 1,
  meta: {
    canvas: { width: 880, height: 720 },
    skin: { id: "slack", options: { channel: "#alerts" } },
  },
  participants: mockParticipants,
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "typing", from: "paul" },
    { type: "message", from: "paul", text: "shouldn't error" },
  ],
};

describe("Builder accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(
      <Builder initialConfig={config} skins={{ slack }} persist={false} />,
    );
    // jsdom has no layout/computed colors, so contrast can't be evaluated here.
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
