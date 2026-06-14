import { describe, expect, it } from "vitest";
import { sanitizeHtml, scrubCss } from "./sanitize.js";
import { HOSTILE_CASES } from "./fixtures/hostile.js";

describe("sanitizeHtml — hostile fixtures", () => {
  for (const c of HOSTILE_CASES) {
    it(`neutralizes: ${c.name}`, () => {
      const out = sanitizeHtml(c.html).toLowerCase();
      for (const banned of c.mustNotContain) {
        expect(out).not.toContain(banned.toLowerCase());
      }
    });
  }

  it("keeps benign presentational markup and inline styles", () => {
    const out = sanitizeHtml(
      `<div class="row" style="color: rgb(91,91,214); padding: 8px"><img class="avatar" src="https://x/a.png" alt="a"><span class="name">Cory</span><p>hello</p></div>`,
    );
    expect(out).toContain('class="row"');
    expect(out).toContain("Cory");
    expect(out).toContain("hello");
    expect(out).toContain("rgb(91,91,214)");
    expect(out).toContain("https://x/a.png");
  });

  it("drops data-* payloads", () => {
    const out = sanitizeHtml(`<div data-secret="hunter2" class="ok">m</div>`);
    expect(out).not.toContain("data-secret");
    expect(out).not.toContain("hunter2");
    expect(out).toContain('class="ok"');
  });

  it("keeps data:image but drops other data: URLs", () => {
    const ok = sanitizeHtml(
      `<img src="data:image/png;base64,iVBORw0KGgo=" alt="x">`,
    );
    expect(ok).toContain("data:image/png");
    const bad = sanitizeHtml(`<img src="data:text/html,<b>x</b>" alt="x">`);
    expect(bad).not.toContain("data:text/html");
  });
});

describe("scrubCss", () => {
  it("blocks expression, import, behavior, moz-binding", () => {
    expect(scrubCss("width: expression(alert(1))")).not.toContain(
      "expression(",
    );
    expect(scrubCss('@import "//evil"; color:red')).not.toContain("@import");
    expect(scrubCss("behavior: url(x.htc)")).not.toContain("behavior:");
    expect(scrubCss("-moz-binding: url(x)")).not.toContain("-moz-binding");
  });

  it("blocks javascript: and non-image data url() targets", () => {
    expect(scrubCss("background: url(javascript:alert(1))")).not.toContain(
      "javascript:",
    );
    expect(
      scrubCss("background: url(data:text/html,<script>x</script>)"),
    ).not.toContain("data:text/html");
  });

  it("preserves image url() and normal declarations", () => {
    const css = "background: url(https://x/a.png); color: #5b5bd6";
    const out = scrubCss(css);
    expect(out).toContain("https://x/a.png");
    expect(out).toContain("#5b5bd6");
  });
});
