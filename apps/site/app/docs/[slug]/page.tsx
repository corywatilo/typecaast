import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Nav } from "../../../components/Nav";
import { Footer } from "../../../components/Footer";
import { DocsViewedTracker } from "../../../components/DocsViewedTracker";
import { SITE_DOCS, docMeta, readDoc, rewriteDocHref } from "../_docs";
import "./prose.css";

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return SITE_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = docMeta(slug);
  if (!meta) return {};
  return { title: `${meta.title} — Typecaast docs`, description: meta.blurb };
}

const components: Components = {
  a: ({ href, children }) => <a href={rewriteDocHref(href)}>{children}</a>,
};

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  const meta = docMeta(slug);
  const md = readDoc(slug);
  if (!meta || md === null) notFound();

  return (
    <>
      <DocsViewedTracker />
      <Nav />
      <main className="wrap" style={{ padding: "48px 24px", maxWidth: 820 }}>
        <p style={{ fontSize: 13, marginBottom: 16 }}>
          <a href="/docs" style={{ color: "var(--tc-accent)" }}>
            ← All docs
          </a>
        </p>
        <article className="tc-prose">
          <Markdown remarkPlugins={[remarkGfm]} components={components}>
            {md}
          </Markdown>
        </article>
        <p style={{ marginTop: 40, fontSize: 13 }} className="tc-muted">
          Edit this guide on{" "}
          <a
            href={`https://github.com/corywatilo/typecaast/blob/master/docs/${slug}.md`}
            style={{ color: "var(--tc-accent)" }}
          >
            GitHub
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
