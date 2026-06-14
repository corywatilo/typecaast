# Font map

Typecaast renders the same frames everywhere (live embed + video export), so a
skin must **never depend on a font that happens to be installed on the viewer's
OS** — it loads the font it declares, or falls back to a documented system
stack. And to respect trade dress (PLAN §19, [`TRADEMARKS.md`](../TRADEMARKS.md))
we **never bundle a proprietary platform font** (SF Pro, gg sans). Instead a skin
records its _intended_ font for transparency and ships an open substitute or an
OS fallback.

Every web font we load is **SIL Open Font License 1.1**.

| Skin              | Real platform font                          | Shipped in the skin                                   | License             | Substitute?                   |
| ----------------- | ------------------------------------------- | ----------------------------------------------------- | ------------------- | ----------------------------- |
| Slack             | Lato                                        | **Lato** (loaded, 400/700/900)                        | OFL 1.1             | No — Slack actually uses Lato |
| iMessage (iOS)    | SF Pro (Apple)                              | **Inter** (loaded, 400/500/600), `intended: "SF Pro"` | OFL 1.1             | Yes                           |
| Messages (macOS)  | SF Pro (Apple)                              | **Inter** (reuses the iMessage declaration)           | OFL 1.1             | Yes                           |
| Claude Code (TUI) | terminal monospace (varies)                 | **JetBrains Mono** (loaded, 400/700)                  | OFL 1.1             | Faithful mono                 |
| WhatsApp          | Helvetica Neue / Segoe UI / Roboto (system) | system stack, no web font                             | n/a (OS fonts)      | OS fallback                   |
| Cursor            | system UI + Menlo/Monaco for code           | system stack, no web font                             | n/a (OS fonts)      | OS fallback                   |
| Discord           | gg sans (Discord)                           | Noto Sans → system stack, no web font                 | OFL 1.1 (Noto) / OS | OS fallback                   |

## Rules for skin authors

- Declare loaded fonts in `meta.fonts` as `FontDeclaration`s; set `intended` when
  you're substituting (so the choice is transparent and auditable).
- Only load **OFL / open-licensed** fonts. Pull them from a stable host
  (Google Fonts / Fontsource CDN today).
- For platforms whose real font is proprietary and visually close to a system
  font (WhatsApp, Cursor, Discord), prefer the **system stack** over bundling —
  it's both lighter and avoids any font-licensing question.
- The renderer waits for declared fonts to load before capturing frames
  (`useSkinFonts` / Remotion `delayRender`), so exports never flash a fallback.

## Deterministic runtime

For byte-stable video exports, fonts and the emoji font are pinned in the render
container — see [`RENDERING.md`](./RENDERING.md) and `docker/Dockerfile.render`
(Noto Color Emoji + the declared web fonts).
