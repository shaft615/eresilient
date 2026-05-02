import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Capability Statement",
  description:
    "e|Resilient Capability Statement — business continuity, crisis management, supply chain risk, and emergency response consulting for SMBs and federal contracting. Master Business Continuity Professional with 25+ years of Fortune 100 practice. DUNS, CAGE, NAICS on file.",
  alternates: { canonical: `${SITE.url}/capabilities` },
};

const coreCompetencies = [
  "Business Continuity, Emergency Response, Supply Chain Risk, and Crisis Management Consulting",
  "Plan exercising and program maintenance",
  "Real-Time Incident Management support services",
  "Developing and actively monitoring your intelligent supply chain",
  "Vendor management and vendor selection support for resiliency solutions",
];

const pastPerformance = [
  "25+ years leading business continuity planning for Fortune 100 companies",
  "Ability to translate process detail into language business owners and their teams understand",
  "High-touch guidance through the continuity planning process, leveraging technology to guide clients end-to-end",
];

export default function CapabilitiesPage() {
  return (
    <>
      <section className="bg-brand-maroon py-16 text-brand-paper sm:py-20">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Capability Statement
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            {SITE.legalName} — Business Continuity Consulting
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            {SITE.legalName} helps protect small and mid-sized businesses by
            creating holistic continuity plans intended to sustain their
            operations should unforeseen disruptions occur.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CtaButton
              href="/capability-statement.pdf"
              external
              className="gap-2"
            >
              <span aria-hidden>↓</span> Download PDF (.pdf)
            </CtaButton>
            <CtaButton href={SITE.calendly} external variant="ghost-on-dark">
              Book a consultation
            </CtaButton>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Core Competencies
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                We provide the following services
              </h2>
              <ul className="mt-6 space-y-3">
                {coreCompetencies.map((c) => (
                  <li
                    key={c}
                    className="flex gap-3 text-base leading-relaxed text-brand-ink-mid"
                  >
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ▪
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Past Performance
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                Why clients choose us
              </h2>
              <ul className="mt-6 space-y-3">
                {pastPerformance.map((p) => (
                  <li
                    key={p}
                    className="flex gap-3 text-base leading-relaxed text-brand-ink-mid"
                  >
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ▪
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 rounded-xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6">
                <p className="text-base leading-relaxed text-brand-ink-mid">
                  The team at {SITE.name} has mastered the skill of business
                  continuity planning. Our time working with Fortune 100
                  companies for over 25 years has provided us with the
                  expertise to help our clients plan for a range of potential
                  occurrences and the most efficient and effective way to
                  tackle the unexpected.
                </p>
                <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
                  We know the importance of keeping your operations running
                  smoothly even when hard times arise. Our main objective is
                  the protection of your business. We will develop an
                  integrated plan to safeguard your business should an
                  unexpected disruption occur.
                </p>
              </div>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  Differentiators
                </p>
                <h3 className="mt-2 font-display text-lg text-brand-maroon">
                  Karl D. Bryant
                </h3>
                <p className="text-sm font-semibold text-brand-ink-light">
                  {SITE.founder.role}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-brand-ink-mid">
                  {SITE.founder.certifications.map((c) => (
                    <li key={c.abbr}>
                      <span className="font-semibold text-brand-ink">
                        {c.abbr}
                      </span>{" "}
                      — {c.name}
                    </li>
                  ))}
                </ul>
                <a
                  href={SITE.contact.emailHref}
                  className="mt-5 block text-sm font-semibold text-brand-orange hover:underline"
                >
                  {SITE.contact.email}
                </a>
                <a
                  href={SITE.contact.phoneHref}
                  className="block text-sm font-semibold text-brand-orange hover:underline"
                >
                  {SITE.contact.phone}
                </a>
              </div>

              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  NAICS Codes
                </p>
                <ul className="mt-4 space-y-2 text-sm text-brand-ink-mid">
                  <li>
                    <span className="font-semibold text-brand-ink">541611</span>{" "}
                    — Administrative Management and General Management
                    Consulting Services
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">524298</span>{" "}
                    — All Other Insurance Related Activities
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">541618</span>{" "}
                    — Other Management Consulting Services
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">541690</span>{" "}
                    — Other Scientific and Technical Consulting Services
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">611420</span>{" "}
                    — Computer Training
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">611430</span>{" "}
                    — Professional and Management Development Training
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-brand-maroon bg-brand-maroon p-6 text-brand-paper">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                  Federal Registration
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <span className="font-semibold">DUNS:</span>{" "}
                    {SITE.federal.duns}
                  </li>
                  <li>
                    <span className="font-semibold">CAGE Code:</span>{" "}
                    {SITE.federal.cage}
                  </li>
                  <li>
                    <span className="font-semibold">EIN:</span>{" "}
                    {SITE.federal.ein}
                  </li>
                </ul>
                <p className="mt-4 text-xs text-brand-taupe/80">
                  Registered with SAM.gov for federal contracting
                  opportunities.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-brand-taupe-light/60 py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon sm:text-3xl">
            Ready to discuss your continuity needs?
          </h2>
          <p className="mt-3 text-base text-brand-ink-mid">
            Karl takes every initial conversation personally. Free 30-minute
            consultation.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton href="/capability-statement.pdf" external variant="ghost">
              <span aria-hidden>↓</span> Download PDF
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
