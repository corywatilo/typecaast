import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { mockParticipants } from "@typecaast/core/mocks";
import { slack } from "@typecaast/skins";
import { Builder } from "./Builder.js";

afterEach(cleanup);

const config: Config = configSchema.parse({
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
    { type: "composerType", from: "cory", text: "Let me check." },
    { type: "send" },
  ],
});

describe("Builder", () => {
  it("renders the preview, controls, and a track chip per step", () => {
    render(<Builder config={config} skin={slack} />);
    expect(screen.getByTestId("builder")).toBeTruthy();
    expect(screen.getByTestId("builder-controls")).toBeTruthy();
    const track = screen.getByTestId("builder-track");
    // One chip (button) per timeline step.
    expect(track.querySelectorAll("button")).toHaveLength(
      config.timeline.length,
    );
  });

  it("play toggles to pause", () => {
    render(<Builder config={config} skin={slack} />);
    const play = screen.getByLabelText("Play");
    act(() => fireEvent.click(play));
    expect(screen.getByLabelText("Pause")).toBeTruthy();
  });

  it("scrubbing advances the preview", () => {
    render(<Builder config={config} skin={slack} />);
    const slider = screen.getByLabelText("Scrub timeline");
    act(() => fireEvent.change(slider, { target: { value: "7800" } }));
    // The PR system card (APP badge) is visible by 7.8s.
    expect(screen.getByText("APP")).toBeTruthy();
  });
});
