import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configSchema, type Config } from "@typecaast/schema";
import { mockParticipants } from "@typecaast/core/mocks";
import { Typecaast } from "@typecaast/react";
import { distill } from "./distill.js";
import { templateSkinFromDraft } from "./template-skin.js";
import { SLACK_THREAD_HTML } from "./fixtures/slack-thread.js";

afterEach(cleanup);

let root: HTMLElement;
beforeEach(() => {
  const host = document.createElement("div");
  host.innerHTML = SLACK_THREAD_HTML;
  root = host.firstElementChild as HTMLElement;
  document.body.appendChild(root);
});
afterEach(() => root.remove());

const config: Config = configSchema.parse({
  version: 1,
  meta: { canvas: { width: 480, height: 720 }, skin: { id: "captured" } },
  participants: mockParticipants,
  timeline: [
    { type: "message", from: "cory", text: "i got a billing toast error?" },
    { type: "message", from: "paul", text: "shouldn't error" },
  ],
});

describe("templateSkinFromDraft", () => {
  it("produces a Skin satisfying the contract", () => {
    const draft = distill(root, { name: "Slack Capture" });
    const skin = templateSkinFromDraft(draft);
    expect(skin.id).toBe("slack-capture");
    expect(skin.meta.name).toBe("Slack Capture");
    expect(skin.components.Frame).toBeTypeOf("function");
    expect(skin.components.Message).toBeTypeOf("function");
    expect(skin.components.Composer).toBeTypeOf("function");
  });

  it("renders the captured skin inside a shadow root (host isolation)", () => {
    const draft = distill(root, { name: "Slack Capture" });
    const skin = templateSkinFromDraft(draft);
    const { container } = render(
      <Typecaast config={config} skin={skin} theme="light" />,
    );
    // The Frame mounts a shadow root — its chrome lives there, not light DOM.
    const shadowHost = container.querySelector("div > div[style*='height']");
    const hostWithShadow = [...container.querySelectorAll("div")].find(
      (d) => d.shadowRoot,
    );
    expect(hostWithShadow).toBeTruthy();
    expect(hostWithShadow!.shadowRoot!.querySelector("style")).toBeTruthy();
    expect(hostWithShadow!.shadowRoot!.innerHTML).toContain("#alerts");
    void shadowHost;
  });
});
