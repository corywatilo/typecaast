import { SITE_DOCS, readDoc } from "../../_docs";

export const dynamic = "force-static";

export function generateStaticParams(): { slug: string }[] {
  return SITE_DOCS.map((d) => ({ slug: d.slug }));
}

// Plain-markdown endpoint (e.g. /docs/pacing/raw) so LLMs and crawlers can fetch
// the source without parsing the rendered page.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  const md = readDoc(slug);
  if (md === null) return new Response("Not found\n", { status: 404 });
  return new Response(md, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
