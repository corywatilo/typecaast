import { act, cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { mockParticipants } from "@typecaast/core/mocks";
import { TypecaastStage, useTypecaast } from "@typecaast/react";
import { importHtml } from "./import-page.js";
import { templateSkinFromDraft } from "./template-skin.js";
import { SLACK_THREAD_HTML } from "./fixtures/slack-thread.js";

afterEach(cleanup);

/**
 * M5.E exit demo: **capture a page → confirm slots → play a simulation in it.**
 * We import a saved page (the importer is the headless twin of the extension),
 * confirm the four message slots auto-detected, build a skin from the draft,
 * drive the engine to the end, and assert the captured skin actually renders
 * the conversation — the full capture→skin→play loop in one test.
 */

const PAGE = `<!doctype html><html><head><title>Slack — #alerts</title></head>
<body><nav>chrome</nav><main>${SLACK_THREAD_HTML}</main></body></html>`;

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "captured" } },
  participants: mockParticipants,
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "message", from: "paul", text: "shouldn't error" },
  ],
});

describe("M5.E — capture → confirm slots → play", () => {
  it("plays the simulation inside the captured skin", () => {
    // 1. Capture (saved-page import) and confirm slots.
    const draft = importHtml(PAGE, {
      selector: ".thread",
      name: "Slack-style",
    });
    expect(draft.detection.message.detected).toEqual(
      expect.arrayContaining(["author", "avatar", "body", "time"]),
    );

    // 2. Build the skin from the draft.
    const skin = templateSkinFromDraft(draft, { id: "slack-style" });
    expect(skin.id).toBe("slack-style");

    // 3. Drive the engine to the final frame.
    const { result } = renderHook(() =>
      useTypecaast(config, { theme: "light" }),
    );
    act(() => result.current.seek(result.current.duration));
    const finalState = result.current.state;
    expect(finalState.messages.length).toBe(2);

    // 4. Render the captured skin at that frame and confirm it shows the thread.
    const { container } = render(
      <TypecaastStage
        state={finalState}
        skin={skin}
        participants={mockParticipants}
      />,
    );
    const host = [...container.querySelectorAll("div")].find(
      (d) => d.shadowRoot,
    );
    expect(host).toBeTruthy();
    const shadowText = host!.shadowRoot!.textContent ?? "";
    expect(shadowText).toContain("#alerts"); // captured chrome
    expect(shadowText).toContain("i got a billing toast error?"); // played message
    expect(shadowText).toContain("shouldn't error");
  });
});
