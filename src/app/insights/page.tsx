import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { getAllArticleMetadata } from "@/content/insights";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practitioner-grade writing on business continuity, BIA, ISO 22301, supply chain resilience, and crisis management — for SMB leaders, by a Master Business Continuity Professional with 25+ years of Fortune 100 practice.",
  alternates: { canonical: `${SITE.url}/insights` },
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function InsightsIndexPage() {
  const articles = await getAllArticleMetadata();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== featured?.slug);

  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Insights
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Field-tested BCM guidance for SMB leaders.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            Long-form pieces drawn from 25+ years of Fortune 100 BCM practice —
            translated for the way SMBs actually operate. No content marketing.
            No filler.
          </p>
        </Container>
      </section>

      {featured && (
        <section className="py-16 sm:py-20">
          <Container width="wide">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              Featured
            </p>
            <Link
              href={`/insights/${featured.slug}`}
              className="group mt-4 block rounded-2xl border border-brand-taupe-mid bg-brand-paper p-8 transition-colors hover:border-brand-orange sm:p-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                {featured.category}
              </p>
              <h2 className="mt-2 font-display text-3xl text-brand-maroon sm:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-ink-mid">
                {featured.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.12em] text-brand-ink-light">
                <span>{featured.author}</span>
                <span aria-hidden>·</span>
                <time dateTime={featured.publishedAt}>
                  {formatDate(featured.publishedAt)}
                </time>
                <span aria-hidden>·</span>
                <span>{featured.readingTimeMinutes} min read</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange transition-transform group-hover:translate-x-0.5">
                Read article <span aria-hidden>→</span>
              </span>
            </Link>
          </Container>
        </section>
      )}

      {rest.length > 0 && (
        <section className="pb-20">
          <Container width="wide">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              All articles
            </p>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {rest.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/insights/${a.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-brand-taupe-mid bg-brand-paper p-6 transition-colors hover:border-brand-orange"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      {a.category}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-brand-maroon">
                      {a.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                      {a.description}
                    </p>
                    <div className="mt-5 flex items-center gap-3 text-xs uppercase tracking-[0.1em] text-brand-ink-light">
                      <time dateTime={a.publishedAt}>
                        {formatDate(a.publishedAt)}
                      </time>
                      <span aria-hidden>·</span>
                      <span>{a.readingTimeMinutes} min</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <section className="bg-brand-taupe-light/60 py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon sm:text-3xl">
            Get new articles in your inbox.
          </h2>
          <p className="mt-3 text-base text-brand-ink-mid">
            The same email list that delivers the BCP Readiness Scorecard sends
            new pieces when they publish. Practitioner-grade only — unsubscribe
            anytime.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <CtaButton href="/resources/bcp-readiness-scorecard">
              Subscribe via the Scorecard
            </CtaButton>
            <CtaButton href={SITE.calendly} external variant="ghost">
              Or book a consultation
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
