import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { JsonLd } from "@/components/json-ld";
import { articleSchema } from "@/lib/structured-data";
import {
  articleSlugs,
  getArticle,
  getRelatedArticles,
} from "@/content/insights";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return articleSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loaded = await getArticle(slug);
  if (!loaded) return {};
  const { metadata } = loaded;
  const url = `${SITE.url}/insights/${metadata.slug}`;
  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: metadata.title,
      description: metadata.description,
      url,
      publishedTime: metadata.publishedAt,
      modifiedTime: metadata.updatedAt ?? metadata.publishedAt,
      authors: [`${SITE.url}/about/karl`],
    },
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loaded = await getArticle(slug);
  if (!loaded) notFound();

  const { Component, metadata } = loaded;
  const related = await getRelatedArticles(metadata.slug);

  return (
    <>
      <JsonLd data={articleSchema(metadata)} />

      {/* Hero */}
      <section className="bg-brand-maroon py-16 text-brand-paper sm:py-20">
        <Container width="narrow">
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange hover:underline"
          >
            <span aria-hidden>←</span> All Insights
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {metadata.category}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {metadata.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-brand-taupe">
            {metadata.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.14em] text-brand-taupe/80">
            <span>{metadata.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={metadata.publishedAt}>
              {formatDate(metadata.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{metadata.readingTimeMinutes} min read</span>
          </div>
        </Container>
      </section>

      {/* Article body */}
      <section className="py-16 sm:py-20">
        <Container width="narrow">
          <article className="article-prose">
            <Component />
          </article>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-brand-taupe-light/60 py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon sm:text-3xl">
            Want to apply this to your business?
          </h2>
          <p className="mt-3 text-base text-brand-ink-mid">
            Take the BCP Readiness Scorecard for an instant maturity reading,
            or book a free 30-minute call with Karl.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <CtaButton href="/resources/bcp-readiness-scorecard">
              Take the Scorecard
            </CtaButton>
            <CtaButton href={SITE.calendly} external variant="ghost">
              Book a consultation
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container width="wide">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              Keep reading
            </p>
            <h2 className="mt-3 font-display text-2xl text-brand-maroon sm:text-3xl">
              Related articles
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/insights/${r.slug}`}
                    className="group block h-full rounded-xl border border-brand-taupe-mid bg-brand-paper p-6 transition-colors hover:border-brand-orange"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      {r.category}
                    </p>
                    <h3 className="mt-2 font-display text-lg text-brand-maroon">
                      {r.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                      {r.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange transition-transform group-hover:translate-x-0.5">
                      Read article <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
