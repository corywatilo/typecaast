// Shared metadata + text for the on-site authoring guides. These three are
// rendered as pages on typecaast.com; the rest of /docs stays GitHub-linked.
// The markdown is imported straight from the repo's /docs and bundled into the
// build (webpack `asset/source` — see next.config.mjs), so there's no generated
// dir and no runtime fs. Keep this list in step with what @typecaast/mcp bundles.
import authoringConfigs from "../../../../docs/authoring-configs.md";
import pacing from "../../../../docs/pacing.md";
import messageContent from "../../../../docs/message-content.md";

export interface SiteDoc {
  slug: string;
  title: string;
  blurb: string;
  text: string;
}

export const SITE_DOCS: SiteDoc[] = [
  {
    slug: "authoring-configs",
    title: "Authoring configs by hand",
    blurb:
      "Every top-level field and timeline step type — write or edit the JSON config without the playground.",
    text: authoringConfigs,
  },
  {
    slug: "pacing",
    title: "Pacing & timing",
    blurb:
      "Gaps, delays, and typing speed — including how to get ~1–2s between messages.",
    text: pacing,
  },
  {
    slug: "message-content",
    title: "Message content",
    blurb: "Message bodies: Slack-style mrkdwn and Block Kit content nodes.",
    text: messageContent,
  },
];

const BY_SLUG = new Map(SITE_DOCS.map((d) => [d.slug, d]));

export function isSiteDoc(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function docMeta(slug: string): SiteDoc | undefined {
  return BY_SLUG.get(slug);
}

/** The doc's markdown, or null if it isn't an on-site doc. */
export function readDoc(slug: string): string | null {
  return BY_SLUG.get(slug)?.text ?? null;
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
