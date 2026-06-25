import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { services } from "@/content/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Six service lines covering business continuity, crisis management, emergency response, supply chain risk, real-time activation support, and training & education — built for SMBs by a Master Business Continuity Professional with 25+ years of Fortune 100 practice.",
  alternates: { canonical: `${SITE.url}/services` },
};

export default function ServicesIndexPage() {
  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Services
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Six service lines, one resilience program.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            Engagements are typically delivered as a sequenced program, but
            every service can be commissioned independently. Each one is
            ISO 22301-aligned and scaled to SMB realities — not Fortune-500
            methodology bolted onto a 50-person company.
          </p>
        </Container>
      </section>

      <section className="section-warm py-20 sm:py-24">
        <Container width="wide">
          <ul className="grid gap-6 md:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="surface-card group flex h-full flex-col rounded-2xl border border-brand-taupe-mid p-8 transition-colors hover:border-brand-orange"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    {s.category}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-brand-maroon">
                    {s.title}
                  </h2>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                    {s.summary}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange transition-transform group-hover:translate-x-0.5">
                    Read full scope <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-taupe-light/60 py-20">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl text-brand-maroon sm:text-4xl">
            Not sure where to start?
          </h2>
          <p className="mt-4 text-base text-brand-ink-mid">
            Most engagements begin with the same conversation: where you are
            today, what your real exposure looks like, and which of the six
            service lines is the right first step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton href="/contact" variant="ghost">
              Other ways to reach us
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
