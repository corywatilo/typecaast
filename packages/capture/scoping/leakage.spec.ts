import { expect, test } from "@playwright/test";

/**
 * Hostile-host-page leakage test (PLAN §10, M5.2c). A captured template skin is
 * rendered with the *same* isolation `templateSkinFromDraft`'s Frame uses — an
 * open shadow root whose `:host{all:initial}` blocks inherited styles — onto a
 * page whose global CSS tries to clobber everything (`* !important`, `div{…}`).
 * We assert **zero leakage in both directions** with real computed styles:
 *
 *   1. host CSS does NOT reach inside the shadow (skin keeps its look), and
 *   2. the skin's styles do NOT escape to host-page siblings.
 *
 * The shadow construction here mirrors the adapter exactly; keep them in sync.
 */

// A sanitized captured frame (inline styles, slot marker) — what a draft holds.
const FRAME_HTML = `
<div class="thread" style="background: rgb(255,255,255); color: rgb(29,28,29); font-family: Lato, sans-serif; padding: 12px">
  <div class="thread-header" style="font-weight: 700">#alerts</div>
  <div class="msg" data-tc-slot="messages" style="color: rgb(29,28,29)">a message</div>
</div>`;

const PAGE = `<!doctype html><html><head><style>
  /* Hostile host page: try to repaint and re-font everything. */
  * { color: rgb(255,0,0) !important; font-family: "Comic Sans MS" !important; }
  div { background: rgb(0,255,0); border: 4px solid rgb(0,0,255); }
  body { margin: 0; }
</style></head><body>
  <p class="host-text">host page paragraph</p>
  <div class="host-box">host page box</div>
  <div id="skin-host"></div>
  <script>
    const host = document.getElementById('skin-host');
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = ':host{all:initial; display:block; width:100%; height:100%;} *{box-sizing:border-box;}';
    shadow.appendChild(style);
    const wrap = document.createElement('div');
    wrap.innerHTML = ${JSON.stringify(FRAME_HTML)};
    shadow.appendChild(wrap);
  </script>
</body></html>`;

test.describe("captured-skin style scoping", () => {
  test("host CSS does not leak INTO the shadow", async ({ page }) => {
    await page.setContent(PAGE);
    const inside = await page.evaluate(() => {
      const shadow = (document.getElementById("skin-host") as HTMLElement)
        .shadowRoot!;
      const thread = shadow.querySelector(".thread") as HTMLElement;
      const header = shadow.querySelector(".thread-header") as HTMLElement;
      const cs = getComputedStyle(thread);
      const hs = getComputedStyle(header);
      return {
        threadBg: cs.backgroundColor,
        headerColor: hs.color,
        headerFont: hs.fontFamily,
      };
    });
    // The skin keeps its own white background — host `div{background:lime}` blocked.
    expect(inside.threadBg).toBe("rgb(255, 255, 255)");
    // Inherited color/font reset by :host{all:initial} — NOT the forced red / Comic Sans.
    expect(inside.headerColor).not.toBe("rgb(255, 0, 0)");
    expect(inside.headerFont).not.toContain("Comic Sans");
  });

  test("skin CSS does not leak OUT to the host page", async ({ page }) => {
    await page.setContent(PAGE);
    const outside = await page.evaluate(() => {
      const p = document.querySelector(".host-text") as HTMLElement;
      const box = document.querySelector(".host-box") as HTMLElement;
      return {
        pColor: getComputedStyle(p).color,
        boxBg: getComputedStyle(box).backgroundColor,
      };
    });
    // Host page is untouched by the skin: its own rules still win.
    expect(outside.pColor).toBe("rgb(255, 0, 0)");
    expect(outside.boxBg).toBe("rgb(0, 255, 0)");
  });
});
