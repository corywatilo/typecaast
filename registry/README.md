# Skin registry

A GitHub-based directory of Typecaast skins. [`skins.json`](./skins.json) is the
source of truth; the hosted gallery renders it. **The registry is a directory,
not an endorsement** — community/third-party skins are untrusted code (sandboxed
at runtime); only use ones you trust.

Built-in (official) skins live in [`@typecaast/skins`](../packages/skins) and are
marked `"official": true`. Community skins live in their authors' own packages
and link out.

## Submit a skin

Open a PR that **adds one entry** to `skins.json` (validated against
[`skins.schema.json`](./skins.schema.json)). Your PR must satisfy the checklist:

### Submission checklist

- [ ] **No bundled proprietary marks or fonts.** Reproduce layout/type/spacing/
      color only; substitute proprietary fonts with OFL ones and document both.
- [ ] **Naming.** `"<Platform>-style"` — not "official"/endorsed. (`TRADEMARKS.md`)
- [ ] **Themes.** Light + dark, unless the real app is single-mode.
- [ ] **Declared fonts** loaded via the skin (no reliance on host OS fonts).
- [ ] **Capabilities** declared honestly.
- [ ] **Storybook stories** + a **visual-regression baseline** (the pixel bar).
- [ ] **Provenance** declared; **clean sample content** (no real customer data).
- [ ] **Untrusted-code note** understood: third-party skins run code.

Entry shape (see existing entries):

```json
{
  "id": "signal",
  "name": "Signal",
  "official": false,
  "author": "your-handle",
  "package": "your-signal-skin",
  "export": "signal",
  "repo": "https://github.com/you/your-signal-skin",
  "themes": ["light", "dark"],
  "intendedFonts": ["Inter"],
  "summary": "Signal-style chat with disappearing-message styling.",
  "verified": "2026-Q3"
}
```

Official vs community skins are visually distinct in the gallery (a badge), so
users never mistake a community skin for first-party. Non-compliant entries can
be delisted; see the takedown policy in [`TRADEMARKS.md`](../TRADEMARKS.md).
