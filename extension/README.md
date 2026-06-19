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

Three paths, all start with a capture.

### Easiest: drop the JSON into the Create-skin editor on typecaast.com

Open [typecaast.com/create-skin](https://typecaast.com/create-skin), drag
the downloaded `*-skin-draft.json` onto the page, and you'll see the slots
rendering against a live dummy conversation in seconds. Each region
(frame / message / composer / system / typing / CSS / tokens) is in its
own tab, so you can fix the auto-detected slot markers, adjust margins,
and iterate against the preview. Download the polished result back to a
`draft.json` and either keep using it as a private skin in your own app
or contribute it to the built-in library (below).

This is the right path if you're going from capture to running skin and
don't need a hand-written component file.

### With an agent: the `/create-skin` Claude Code skill

If you use Claude Code in this repo, run **`/create-skin`** and hand it the
captured draft (or a reference screenshot). The skill walks reference →
tokens → components → capabilities → fonts → stories + visual regression
baseline. Use this when you want a hand-written component skin (Slack /
Discord pattern) rather than the slot-template skin.

### Headless: scaffold a template skin from the CLI

```bash
npx @typecaast/cli scaffold-skin path/to/skin-draft.json --name "Slack-style"
```

(or install once with `npm i -g @typecaast/cli` and run `typecaast scaffold-skin …`).

The output is a usable template skin you can drop into your own React app
and pass to `<Typecaast skin={…} />`.

## Contributing your skin to the built-in library

If you'd like your skin to ship with `@typecaast/skins` (so it shows up in the
playground and builder for everyone), the path is:

1. **Capture** with this extension and run **`/create-skin`** (or
   `scaffold-skin`) against the draft.
2. **Move** the generated folder into `packages/skins/src/<your-skin>/`.
3. **Register** the skin in the four touchpoints we use for lazy loading:
   - `packages/skins/src/registry.ts` (the `builtinSkins` map)
   - `packages/skins/package.json` `exports` (`./<your-skin>` subpath)
   - `packages/react/src/builtin-skins.ts` (one line in `BUILTIN_SKIN_LOADERS`)
   - `registry/skins.json` (row for the CI `check:registry` gate)
4. **Group it** in the App picker by editing `APP_GROUPS` /
   `APP_LABELS` in `packages/builder/src/panels/SkinPanel.tsx`. Community
   submissions live under the **Community** group.
5. **Build & gate**: `pnpm build && pnpm typecheck && pnpm test &&
pnpm check:registry`. Add a changeset (`pnpm changeset`) for any publishable
   change.
6. **Open a PR** with the changeset, a screenshot of the running skin in the
   playground, and a note about the source page.

### Guidelines

We aim to keep the built-in library focused on **widely-adopted apps** — chat
UIs, code/agent surfaces, and messengers most people will recognize at a
glance. A skin is a better candidate if:

- The app has broad usage (consumer or developer audience) so the skin
  unlocks recognizable demos for many users.
- It plays back the core experience: messages, composer, and at least one
  affordance the platform is known for (reactions, system cards, typing, …).
- Trade dress only — **no third-party logos, brand icons, or proprietary
  fonts** in the repo. Reference open-licensed substitutes; users supply the
  rest. See `TRADEMARKS.md`.
- Both themes when feasible; light-only or dark-only is fine if the source
  app only has one.

Niche or single-tenant UIs are still welcome as **community skins** you ship
in your own package; the [registry](../registry/) lists those alongside the
built-ins.

## Security

Captured markup is **untrusted**. It is allowlist-sanitized on capture and
rendered in a shadow root by the `TemplateSkinAdapter`. Don't bundle proprietary
fonts/marks; name skins `"<Platform>-style"`.

> Not published to the Chrome Web Store from this repo; it's a developer tool you
> load unpacked.
