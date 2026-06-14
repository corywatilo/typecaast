import { describe, expect, it } from "vitest";
import { importHtml } from "./import-page.js";
import { skinDraftSchema } from "./draft.js";
import { SLACK_THREAD_HTML } from "./fixtures/slack-thread.js";

const PAGE = `<!doctype html><html><head><title>Slack — #alerts</title></head>
<body><nav>site chrome</nav><main>${SLACK_THREAD_HTML}</main></body></html>`;

describe("importHtml", () => {
  it("distills a saved .html page into a valid draft", () => {
    const draft = importHtml(PAGE, { selector: ".message-list" });
    expect(() => skinDraftSchema.parse(draft)).not.toThrow();
    expect(draft.detection.message.found).toBe(true);
    expect(draft.detection.message.detected).toEqual(
      expect.arrayContaining(["author", "body"]),
    );
  });

  it("guesses the thread when no selector is given", () => {
    const draft = importHtml(PAGE);
    expect(draft.detection.message.found).toBe(true);
  });

  it("defaults the name from the document title", () => {
    const draft = importHtml(PAGE, { selector: ".thread" });
    expect(draft.meta.name).toContain("#alerts");
  });

  it("unwraps a minimal MHTML archive", () => {
    const mhtml = [
      "From: <Saved by Blink>",
      "Content-Type: multipart/related; boundary=B",
      "",
      "--B",
      "Content-Type: text/html",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      `<main>${SLACK_THREAD_HTML.replace(/=/g, "=3D")}</main>`,
      "--B--",
    ].join("\r\n");
    const draft = importHtml(mhtml, { mhtml: true });
    expect(draft.detection.message.found).toBe(true);
  });
});
