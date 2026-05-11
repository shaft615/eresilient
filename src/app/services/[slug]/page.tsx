import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { JsonLd } from "@/components/json-ld";
import { serviceSchema } from "@/lib/structured-data";
import { getRelatedServices, getService, services } from "@/content/services";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `${SITE.url}/services/${service.slug}` },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      url: `${SITE.url}/services/${service.slug}`,
      type: "website",
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.slug);

  return (
    <>
      <JsonLd data={serviceSchema(service)} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-maroon text-brand-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(251,92,1,0.22) 0%, transparent 70%)",
          }}
        />
        <Container width="wide" className="relative py-20 sm:py-24 lg:py-28">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange hover:underline"
          >
            <span aria-hidden>←</span> All Services
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {service.category}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            {service.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            {service.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <CtaButton href={SITE.calendly} external>
              {service.ctaLabel}
            </CtaButton>
            <CtaButton
              href={SITE.contact.phoneHref}
              variant="ghost-on-dark"
            >
              Call {SITE.contact.phone}
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="bg-brand-taupe-light/60 py-20">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            Why It Matters
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            {service.hero.headline}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            {service.problem}
          </p>
        </Container>
      </section>

      {/* Whats included + Deliverables */}
      <section className="py-20">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                What&apos;s Included
              </p>
              <h2 className="mt-3 font-display text-2xl text-brand-maroon sm:text-3xl">
                Scope of engagement
              </h2>
              <ul className="mt-6 space-y-3">
                {service.whatsIncluded.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-brand-ink-mid">
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ▸
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Deliverables
              </p>
              <h2 className="mt-3 font-display text-2xl text-brand-maroon sm:text-3xl">
                What you walk away with
              </h2>
              <ul className="mt-6 space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-brand-ink-mid">
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured product (e.g. riscManager.com™ on supply-chain-risk) */}
      {service.featuredProduct && (
        <section className="bg-brand-taupe-light/60 py-20">
          <Container width="wide">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                  Powered by
                </p>
                <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                  {service.featuredProduct.name}
                </h2>
                <p className="mt-3 font-display text-lg text-brand-ink-mid">
                  {service.featuredProduct.tagline}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
                <p className="text-base leading-relaxed text-brand-ink-mid">
                  {service.featuredProduct.summary}
                </p>
                <div className="mt-6">
                  <CtaButton
                    href={`/products/${service.featuredProduct.slug}`}
                  >
                    {service.featuredProduct.ctaLabel} <span aria-hidden>→</span>
                  </CtaButton>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Process */}
      <section className="bg-brand-maroon py-20 text-brand-paper">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              Engagement Model
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              How this engagement runs.
            </h2>
          </div>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {service.process.map((step) => (
              <li
                key={step.step}
                className="rounded-xl border border-brand-paper/15 bg-brand-paper/5 p-6 backdrop-blur"
              >
                <div className="font-display text-3xl text-brand-orange">
                  {step.step}
                </div>
                <h3 className="mt-3 font-display text-lg">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-taupe">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Who its for + ISO refs */}
      <section className="py-20">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Right Fit
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                You should engage if&hellip;
              </h2>
              <ul className="mt-6 space-y-4">
                {service.whoItsFor.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-relaxed text-brand-ink-mid"
                  >
                    <span aria-hidden className="mt-1 text-brand-orange">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {service.isoRefs.length > 0 && (
              <aside className="rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6">
                <h3 className="font-display text-lg text-brand-maroon">
                  Standards Alignment
                </h3>
                <p className="mt-2 text-sm text-brand-ink-light">
                  This engagement maps to the following ISO standards and
                  industry references:
                </p>
                <ul className="mt-4 space-y-2 text-sm text-brand-ink-mid">
                  {service.isoRefs.map((ref) => (
                    <li key={ref} className="flex gap-2">
                      <span aria-hidden className="text-brand-orange">
                        ▸
                      </span>
                      <span>{ref}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </Container>
      </section>

      {/* Service-specific final CTA */}
      <section className="bg-brand-maroon py-20 text-brand-paper">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Ready to scope a {service.shortTitle.toLowerCase()} engagement?
          </h2>
          <p className="mt-4 text-base text-brand-taupe">
            Book a free 30-minute call. We&apos;ll cover where you are, where
            you need to be, and whether this is the right next step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {service.ctaLabel}
            </CtaButton>
            <CtaButton href="/contact" variant="ghost-on-dark">
              Other ways to reach us
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* Related services */}
      {related.length > 0 && (
        <section className="bg-brand-taupe-light/60 py-20">
          <Container width="wide">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              Related Services
            </p>
            <h2 className="mt-3 font-display text-2xl text-brand-maroon sm:text-3xl">
              Often delivered alongside
            </h2>
            <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/services/${r.slug}`}
                    className="group block h-full rounded-xl border border-brand-taupe-mid bg-brand-paper p-6 transition-colors hover:border-brand-orange"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      {r.category}
                    </p>
                    <h3 className="mt-2 font-display text-lg text-brand-maroon">
                      {r.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                      {r.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange transition-transform group-hover:translate-x-0.5">
                      Learn more <span aria-hidden>→</span>
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
