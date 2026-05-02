import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Schedule Your BCM Consultation",
  description:
    "Reach Karl Bryant directly to schedule a free 30-minute business continuity consultation, or use our inline calendar to book a time that works for you.",
  alternates: { canonical: `${SITE.url}/contact` },
};

const calendlyEmbedUrl = `${SITE.calendly}?embed_domain=eresilient.com&embed_type=Inline&hide_event_type_details=0&hide_gdpr_banner=1`;

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-maroon py-16 text-brand-paper sm:py-20">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Contact
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Let&apos;s talk about your continuity program.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-taupe">
            Pick a time below for a free 30-minute consultation, or reach Karl
            directly by phone or email. Every initial call is taken personally —
            no SDRs, no qualification gauntlet.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
            {/* Calendly inline embed */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Book a Time
              </p>
              <h2 className="mt-2 font-display text-2xl text-brand-maroon">
                Schedule your free 30-minute consultation
              </h2>
              <div className="mt-6 overflow-hidden rounded-xl border border-brand-taupe-mid bg-brand-paper">
                <iframe
                  src={calendlyEmbedUrl}
                  title="Schedule a consultation with Karl Bryant"
                  className="h-[760px] w-full"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 text-xs text-brand-ink-light">
                Calendar not loading?{" "}
                <a
                  href={SITE.calendly}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Open in a new tab
                </a>
                .
              </p>
            </div>

            {/* Direct contact */}
            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-brand-maroon bg-brand-maroon p-7 text-brand-paper">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  Reach Karl Directly
                </p>
                <h2 className="mt-2 font-display text-2xl">
                  {SITE.founder.name}
                </h2>
                <p className="text-sm text-brand-taupe">
                  {SITE.founder.role}
                </p>

                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Phone
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={SITE.contact.phoneHref}
                        className="text-base font-semibold hover:text-brand-orange"
                      >
                        {SITE.contact.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Email
                    </dt>
                    <dd className="mt-1">
                      <a
                        href={SITE.contact.emailHref}
                        className="text-base hover:text-brand-orange"
                      >
                        {SITE.contact.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Office
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-brand-taupe">
                      {SITE.contact.address.street}
                      <br />
                      {SITE.contact.address.city},{" "}
                      {SITE.contact.address.region}{" "}
                      {SITE.contact.address.postal}
                    </dd>
                  </div>
                </dl>

                <p className="mt-6 text-xs text-brand-taupe/80">
                  Initial responses within one business day. Active engagements
                  receive same-day response during business hours (Central
                  Time).
                </p>
              </div>

              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6 text-sm text-brand-ink-mid">
                <h3 className="font-display text-base text-brand-maroon">
                  In an active incident?
                </h3>
                <p className="mt-3">
                  Real-time activation support is available to engaged clients
                  on pre-negotiated terms. If you&apos;re mid-incident and
                  don&apos;t have a contract in place,{" "}
                  <a
                    href={SITE.contact.phoneHref}
                    className="font-semibold text-brand-orange hover:underline"
                  >
                    call directly
                  </a>{" "}
                  — we&apos;ll figure out next steps on the call.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-brand-taupe-light/60 py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon">
            Prefer to read first?
          </h2>
          <p className="mt-3 text-sm text-brand-ink-mid">
            Download the BCP Readiness Scorecard — a quick self-assessment of
            your current program maturity, with the gaps that typically matter
            most for SMBs.
          </p>
          <div className="mt-6">
            <CtaButton href="/resources/bcp-readiness-scorecard">
              Download the Scorecard
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
