import { SITE_DOCS, readDoc } from "../docs/_docs";

export const dynamic = "force-static";

// The on-site authoring guides concatenated into one plain-text file for
// one-shot ingestion by an LLM. Index: https://typecaast.com/llms.txt
export async function GET(): Promise<Response> {
  let out =
    "# Typecaast — authoring guides (full text)\n\nIndex: https://typecaast.com/llms.txt\n";
  for (const d of SITE_DOCS) {
    const md = readDoc(d.slug);
    if (md === null) continue;
    out += `\n\n${"=".repeat(72)}\n# ${d.title}  (https://typecaast.com/docs/${d.slug})\n${"=".repeat(72)}\n\n${md}`;
  }
  return new Response(out, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
