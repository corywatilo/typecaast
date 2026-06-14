import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
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
    { type: "reaction", target: "$prev", emoji: "🦔" },
    { type: "typing", from: "paul" },
  ],
};

describe("Builder", () => {
  it("renders the timeline, header count, and previews the skin", () => {
    render(<Builder initialConfig={config} skins={{ slack }} />);
    expect(screen.getByText("Typecaast")).toBeTruthy();
    expect(screen.getByText(/3 steps/)).toBeTruthy();
    // Step rows show their type badges.
    expect(screen.getAllByText("message").length).toBeGreaterThan(0);
    // Preview renders the Slack thread chrome.
    expect(screen.getByText("Thread")).toBeTruthy();
  });

  it("selecting a step opens the editor", () => {
    render(<Builder initialConfig={config} skins={{ slack }} />);
    const firstStep = screen.getAllByText("message")[0]!;
    act(() => fireEvent.click(firstStep));
    // The step editor shows the message text in a textarea.
    expect(
      screen.getByDisplayValue("i got a billing toast error?"),
    ).toBeTruthy();
  });

  it("adding a step grows the timeline", () => {
    render(<Builder initialConfig={config} skins={{ slack }} />);
    act(() => fireEvent.click(screen.getByText("+ Step")));
    act(() => fireEvent.click(screen.getByText("send")));
    expect(screen.getByText(/4 steps/)).toBeTruthy();
  });

  it("editing a message updates the preview", () => {
    render(<Builder initialConfig={config} skins={{ slack }} />);
    act(() => fireEvent.click(screen.getAllByText("message")[0]!));
    const textarea = screen.getByDisplayValue("i got a billing toast error?");
    act(() =>
      fireEvent.change(textarea, { target: { value: "totally new text" } }),
    );
    expect(screen.getByDisplayValue("totally new text")).toBeTruthy();
  });
});
