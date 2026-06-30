// Shared metadata + reader for the on-site authoring guides. These three are
// rendered as pages on typecaast.com; the rest of /docs stays GitHub-linked.
// Source markdown is synced into content/docs by scripts/sync-docs.mjs — keep
// the slug list here in sync with that script's DOCS array.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface SiteDoc {
  slug: string;
  title: string;
  blurb: string;
}

export const SITE_DOCS: SiteDoc[] = [
  {
    slug: "authoring-configs",
    title: "Authoring configs by hand",
    blurb:
      "Every top-level field and timeline step type — write or edit the JSON config without the playground.",
  },
  {
    slug: "pacing",
    title: "Pacing & timing",
    blurb:
      "Gaps, delays, and typing speed — including how to get ~1–2s between messages.",
  },
  {
    slug: "message-content",
    title: "Message content",
    blurb: "Message bodies: Slack-style mrkdwn and Block Kit content nodes.",
  },
];

const SLUGS = new Set(SITE_DOCS.map((d) => d.slug));

export function isSiteDoc(slug: string): boolean {
  return SLUGS.has(slug);
}

export function docMeta(slug: string): SiteDoc | undefined {
  return SITE_DOCS.find((d) => d.slug === slug);
}

const DOCS_DIR = join(process.cwd(), "content", "docs");

/** Read a synced doc's markdown, or null if it isn't an on-site doc / is missing. */
export function readDoc(slug: string): string | null {
  if (!SLUGS.has(slug)) return null;
  try {
    return readFileSync(join(DOCS_DIR, `${slug}.md`), "utf8");
  } catch {
    return null;
  }
}

export const REPO = "https://github.com/corywatilo/typecaast/blob/master";

/**
 * Rewrite a relative markdown link for the rendered site:
 * - `./pacing.md` → `/docs/pacing` when it's an on-site doc;
 * - other `*.md` / `../…` repo paths → the GitHub blob URL (no dangling links);
 * - absolute URLs and anchors pass through unchanged.
 */
export function rewriteDocHref(href: string | undefined): string {
  if (!href) return "#";
  if (/^(https?:)?\/\//.test(href) || href.startsWith("#")) return href;

  const md = href.match(/^\.?\/?([\w-]+)\.md(#.*)?$/);
  if (md) {
    const [, slug, hash = ""] = md;
    return isSiteDoc(slug)
      ? `/docs/${slug}${hash}`
      : `${REPO}/docs/${slug}.md${hash}`;
  }

  const clean = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
  return `${REPO}/${clean}`;
}
