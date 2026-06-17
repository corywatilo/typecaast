import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema, type ConfigInput } from "@typecaast/schema";
import { claudeCode, slack } from "@typecaast/skins";
import { Builder } from "./Builder.js";
import { capabilityLint } from "./lint.js";

afterEach(cleanup);

const config: ConfigInput = {
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "slack" } },
  participants: [
    { id: "a", name: "Ada", isSelf: true },
    { id: "b", name: "Bo" },
  ],
  timeline: [
    { type: "message", from: "a", text: "hi" },
    { type: "reaction", target: "$prev", emoji: "🦔" },
  ],
};

describe("capabilityLint", () => {
  it("flags steps the skin drops", () => {
    const parsed = configSchema.parse(config);
    // The TUI drops reactions.
    const warnings = capabilityLint(parsed, claudeCode);
    expect(warnings.some((w) => w.message.includes("reaction"))).toBe(true);
    // Slack supports reactions → no reaction warning.
    expect(capabilityLint(parsed, slack)).toHaveLength(0);
  });
});

describe("Builder inspector tabs", () => {
  it("Participants tab manages participants", () => {
    render(
      <Builder
        initialConfig={config}
        skins={{ slack, "claude-code": claudeCode }}
      />,
    );
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Participants" })),
    );
    expect(screen.getByDisplayValue("Ada")).toBeTruthy();
    act(() => fireEvent.click(screen.getByText("+ Add participant")));
    expect(screen.getByDisplayValue("New person")).toBeTruthy();
  });

  it("Skin tab switches skins and shows the capability lint", () => {
    render(
      <Builder
        initialConfig={config}
        skins={{ slack, "claude-code": claudeCode }}
      />,
    );
    act(() => fireEvent.click(screen.getByRole("button", { name: "App" })));
    // Switch to the TUI → its lint warns about the reaction step.
    const select = screen.getByDisplayValue("Slack");
    act(() => fireEvent.change(select, { target: { value: "claude-code" } }));
    expect(screen.getByText("Capability lint")).toBeTruthy();
    expect(screen.getByText(/drops "reaction"/)).toBeTruthy();
  });
});
