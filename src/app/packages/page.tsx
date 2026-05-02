import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { packages } from "@/content/packages";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Three engagement tiers — Foundation, Program, and Enterprise — covering single-function BCP through full BCM programs with ongoing governance. Starting-at pricing for SMB business continuity consulting.",
  alternates: { canonical: `${SITE.url}/packages` },
};

export default function PackagesPage() {
  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Engagement Tiers
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Three packages, sized to where you are.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            Most engagements fit one of these three shapes. Pricing is shown as
            a starting-at floor — final scope is set after a discovery call.
            Every tier is ISO 22301-aligned and built for SMB operational
            realities.
          </p>
        </Container>
      </section>

      <section className="py-20">
        <Container width="wide">
          <ul className="grid gap-6 lg:grid-cols-3">
            {packages.map((p) => (
              <li
                key={p.slug}
                className={`flex flex-col rounded-2xl border p-7 ${
                  p.highlight
                    ? "border-brand-orange bg-brand-paper shadow-lg shadow-brand-orange/10 ring-1 ring-brand-orange"
                    : "border-brand-taupe-mid bg-brand-paper"
                }`}
              >
                {p.highlight && (
                  <div className="mb-4 inline-flex w-fit rounded-full bg-brand-orange px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-paper">
                    Most common
                  </div>
                )}
                <h2 className="font-display text-3xl text-brand-maroon">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink-mid">
                  {p.tagline}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 border-y border-brand-taupe-mid py-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink-light">
                      Starting at
                    </p>
                    <p className="mt-1 font-display text-2xl text-brand-orange">
                      {p.startingAt}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-ink-light">
                      Typical duration
                    </p>
                    <p className="mt-1 text-sm font-semibold text-brand-ink">
                      {p.duration}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  Best for
                </p>
                <p className="mt-1 text-sm leading-relaxed text-brand-ink-mid">
                  {p.bestFor}
                </p>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  What&apos;s included
                </p>
                <ul className="mt-3 space-y-2">
                  {p.includes.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm leading-relaxed text-brand-ink-mid"
                    >
                      <span aria-hidden className="mt-1 text-brand-orange">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {p.excludes.length > 0 && (
                  <>
                    <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light">
                      Not included
                    </p>
                    <ul className="mt-3 space-y-2">
                      {p.excludes.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-sm leading-relaxed text-brand-ink-light"
                        >
                          <span
                            aria-hidden
                            className="mt-1 text-brand-ink-faint"
                          >
                            ─
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="mt-8 pt-6">
                  <CtaButton
                    href={SITE.calendly}
                    external
                    className="w-full"
                    variant={p.highlight ? "primary" : "ghost"}
                  >
                    {p.ctaLabel}
                  </CtaButton>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-taupe-light/60 py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon sm:text-3xl">
            Not sure which tier fits?
          </h2>
          <p className="mt-3 text-base text-brand-ink-mid">
            Most discovery calls end with a clear recommendation in 30 minutes.
            If your situation needs a hybrid or a custom shape, we&apos;ll scope
            it on the call.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton href="/services" variant="ghost">
              Browse service lines
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
