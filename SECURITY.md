# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public issue.

- Use [GitHub private vulnerability reporting](https://github.com/typecaast/typecaast/security/advisories/new) ("Report a vulnerability"), or
- email **security@typecaast.com**.

**Target first response: within 72 hours.** We will acknowledge, investigate, and coordinate a fix and disclosure timeline with you. We credit reporters who want credit.

## Scope of particular interest

Typecaast ingests **untrusted HTML/CSS** through its capture and template-skin path, so that surface gets the most scrutiny:

- **Template-skin XSS / injection.** Captured or imported HTML+CSS, and any third-party skin, are untrusted by default. They are sanitized on capture/import with a maintained allowlist sanitizer (DOMPurify-class), rendered inside a shadow-DOM + sandboxed `<iframe>` boundary, and constrained by a strict Content-Security-Policy. A hostile-fixture suite runs in CI; any escape fails the build.
- **SSRF / egress** (future hosted render service). Server-side rendering of `assets: "url"` configs blocks private/loopback/link-local and cloud-metadata IPs (resolve-then-validate), allowlists `https` + `image/*` only, and enforces size/time limits.

A third-party security review / pentest of the capture + template-skin path is a hard gate before any public launch.

## Supported versions

Pre-1.0, only the latest `0.x` release receives security fixes.

## Secrets

This is a public repository. All secrets live in CI/host environments only and are never committed. Secret scanning + push protection are enabled; report any leaked credential you find via the channel above.
