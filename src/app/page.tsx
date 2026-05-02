import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-maroon text-brand-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(251,92,1,0.22) 0%, transparent 70%)",
          }}
        />
        <Container width="wide" className="relative py-24 sm:py-32 lg:py-40">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Business Continuity Consulting · ISO 22301 Aligned
          </p>
          <h1 className="max-w-4xl font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            {SITE.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            We help small and mid-sized businesses build ISO 22301-aligned
            continuity programs — so when disruption hits, you recover fast and
            lose nothing critical.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton
              href="/resources/bcp-readiness-scorecard"
              variant="ghost-on-dark"
            >
              Download the BCP Readiness Scorecard
            </CtaButton>
          </div>
        </Container>

        <div className="border-t border-brand-paper/10">
          <Container width="wide" className="py-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-medium uppercase tracking-[0.12em] text-brand-taupe/85 sm:justify-between">
              {SITE.founder.credentials.map((c) => (
                <li key={c} className="whitespace-nowrap">
                  {c}
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </section>

      <section className="py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Site rebuild in progress
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            A new {SITE.name} is on the way.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            Service detail pages, packages, the BCP Readiness Scorecard, and the
            insights library are being added page by page. In the meantime, the
            consultation calendar is open — Karl Bryant takes every call
            personally.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton href={SITE.contact.phoneHref} variant="ghost">
              Call {SITE.contact.phone}
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
