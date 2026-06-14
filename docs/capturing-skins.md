# Capture a skin

Building a skin by hand (see [Build a skin](./authoring-skins.md)) gives you
pixel control. **Capture** is the shortcut: point the tooling at a real chat UI,
and it distills the visible thread into a _draft_ skin — sanitized HTML
templates with named slots, extracted tokens, and a report of what it found.
Capture gets you ~80% of the way; you confirm the slots and ship.

> **Capture is the cut-line feature (PLAN §10/§14).** The component skin API
> already covers any UI by hand; capture just removes the typing. Treat captured
> markup as **untrusted** — it's allowlist-sanitized on the way in and rendered
> in a shadow root at runtime.

## Two ways to capture

### A. The Chrome extension (live page)

```bash
pnpm --filter @typecaast/extension build      # → extension/dist
```

Load `extension/dist` unpacked (`chrome://extensions` → Developer mode → Load
unpacked). Then on the target page: click the toolbar icon → **Pick & capture**
→ hover to highlight the thread container → click. A `…-skin-draft.json`
downloads. Nothing leaves your machine — the extension has no host permissions
and makes no network requests.

### B. The saved-page importer (headless)

Save the page (`⌘S` → "Webpage, Complete" or `.mhtml`), then:

```ts
import { importHtml } from "@typecaast/capture/import";
import { readFileSync } from "node:fs";

const draft = importHtml(readFileSync("thread.html", "utf8"), {
  selector: ".message-list", // omit to let it guess the thread
  name: "Slack-style",
});
```

Both paths run the **same distiller**, so they produce the same `SkinDraft`.

## What the distiller does

1. **Isolates** the selected subtree; drops hidden DOM, `data-*` payloads, and
   off-screen rows.
2. **Sanitizes** to an allowlist (no scripts, handlers, iframes, forms,
   `javascript:`/non-image `data:` URLs, or CSS hazards).
3. Finds the **repeating message row** and slot-ifies it:
   `data-tc-slot="author|avatar|body|time"`.
4. Carves the **frame chrome** around a `data-tc-slot="messages"` mount and finds
   the **composer**.
5. Extracts **color / font / spacing / radius tokens**.
6. Emits a **detection report** + **warnings** so you know what to confirm.

## Turn the draft into a skin

```bash
typecaast scaffold-skin thread-skin-draft.json --name "Slack-style"
# → skins/slack-style/{index.ts, draft.json, capabilities.ts, README.md}
```

The generated `index.ts` plays back immediately:

```tsx
import { Typecaast } from "@typecaast/react";
import { slackStyle } from "./skins/slack-style/index.js";

<Typecaast config={config} skin={slackStyle} autoplay loop />;
```

## Cleanup walkthrough (the 20%)

Open the generated `README.md` — it's a per-capture checklist built from the
detection report. For each unchecked or wrong slot, edit `draft.json`:

- **Wrong body / author / time** — move the `data-tc-slot="…"` marker to the
  correct element inside `slots.message`.
- **Missing composer** — add a `slots.composer` template with
  `data-tc-slot="composer"`, or drop the composer from `capabilities`.
- **No frame chrome** — the message list was the capture root; wrap it with
  header/footer markup and a `data-tc-slot="messages"` mount in `slots.frame`.
- **Tokens** — rename the extracted `color-N` keys to meaningful names and prune
  duplicates.
- **capabilities.ts** — declare only what the UI actually renders.

### Light + dark

Capture the same UI twice (once per theme) and merge:

```ts
import { mergeThemeDrafts } from "@typecaast/capture";
const draft = mergeThemeDrafts(lightDraft, darkDraft); // adds darkTokens
```

The skin then switches CSS variables by theme automatically.

## When capture isn't enough

If a UI can't clear the quality bar (median slot-detection ≥ 0.8, zero style
leakage, ≤ 10-min manual fix), keep it as a **draft** with a warning rather than
ship it as a finished skin — or build that one by hand. The captured template
adapter is a faithful _playback_; for full fidelity (rich content, reactions,
read receipts), graduate to a hand-written component skin.
