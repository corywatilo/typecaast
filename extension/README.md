# Typecaast Capture (MV3 extension)

Pick a chat UI on any page and capture it into a Typecaast `SkinDraft` — the
same artifact the [saved-page importer](../packages/capture) and
`typecaast scaffold-skin` consume. **Everything stays on your machine:** the
extension has no host permissions and makes no network requests (PLAN §10/§18).

## Build & load

```bash
pnpm --filter @typecaast/extension build   # → extension/dist
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load
unpacked** → select `extension/dist`.

## Use

1. Open the page with the chat thread you want.
2. Click the Typecaast Capture toolbar icon → **Pick & capture**.
3. Hover to highlight the thread container, click to capture (Esc cancels).
4. A `…-skin-draft.json` downloads (and the last draft is kept in the popup).

## Turn a draft into a skin

```bash
typecaast scaffold-skin path/to/skin-draft.json --name "Slack-style"
```

Open the generated `README.md` and confirm the slots the distiller auto-detected
— capture gets you ~80% of the way (PLAN §10).

## Security

Captured markup is **untrusted**. It is allowlist-sanitized on capture and
rendered in a shadow root by the `TemplateSkinAdapter`. Don't bundle proprietary
fonts/marks; name skins `"<Platform>-style"`.

> Not published to the Chrome Web Store from this repo; it's a developer tool you
> load unpacked.
