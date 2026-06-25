import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — Business Continuity Consulting for SMBs`,
  description: SITE.description,
  alternates: { canonical: SITE.url },
};

const services = [
  {
    title: "Business Continuity Planning",
    slug: "business-continuity-planning",
    summary:
      "ISO 22301-aligned business continuity plan (BCP) development. Risk assessment, Business Impact Analysis (BIA), strategy selection, and tested plans deployed where your team will actually use them.",
  },
  {
    title: "Crisis Management",
    slug: "crisis-management",
    summary:
      "Governance, team structure, and trigger protocols. Executive education and integrated crisis / business continuity management (BCM) exercises that surface gaps before they cost you.",
  },
  {
    title: "Emergency Response",
    slug: "emergency-response",
    summary:
      "Bespoke emergency response plans built from your risk profile. Flip-charts, role definitions, and drills that prepare every shift, not just leadership.",
  },
  {
    title: "Supply Chain Risk",
    slug: "supply-chain-risk",
    summary:
      "Global supply chain mapping, supplier monitoring, and dynamic mitigation strategies. Integrated with ERP and continuity programs.",
  },
  {
    title: "Real-Time Support",
    slug: "real-time-support",
    summary:
      "Just-in-time activation support during a real incident. Plan deployment, vendor engagement, after-action reviews — pre-negotiated rates, on call.",
  },
  {
    title: "Training & Education",
    slug: "training-and-education",
    summary:
      "Standalone, role-based BCM, crisis, and emergency-response training. Executive briefings, practitioner workshops, and certification preparation that build durable in-house capability.",
  },
];

const howItWorks = [
  {
    n: "01",
    title: "Discovery",
    body: "We map your operations, dependencies, and current state in a focused intake — usually one to two working sessions.",
  },
  {
    n: "02",
    title: "Business Impact Analysis",
    body: "Department-level BIA quantifies what disruption costs you. Recovery Time Objective (RTO), Recovery Point Objective (RPO), and Maximum Tolerable Period of Disruption (MTPD) become numbers, not guesses.",
  },
  {
    n: "03",
    title: "Plan Build",
    body: "Continuity, crisis, emergency response, and supply chain plans built around your BIA outputs and ISO 22301 alignment.",
  },
  {
    n: "04",
    title: "Test & Maintain",
    body: "Tabletop exercises, after-action review (AAR) driven updates, and ongoing program governance — so the plan stays current as your business changes.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-brand-maroon text-brand-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full"
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
      </section>

      {/* 2. Credibility bar */}
      <section className="border-b border-brand-taupe-mid/60 bg-brand-cream">
        <Container width="wide" className="py-7">
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink-light">
            {SITE.team.credentials.map((c) => (
              <li key={c} className="whitespace-nowrap">
                {c}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3. Problem */}
      <section className="bg-brand-taupe-light/60 py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            The Problem
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            Most SMBs find out their continuity plan didn&apos;t work the day
            they need it.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-ink-mid">
            <p>
              A binder on a shelf is not a plan. A document copied from a
              template, never tested, with named roles that left the company two
              years ago — that is the most common state of business continuity
              at companies under 500 employees.
            </p>
            <p>
              Then a vendor outage, a ransomware event, a supplier shutdown, or
              a weather event arrives, and the cost of the gap shows up
              immediately: lost revenue, missed SLAs, regulatory exposure,
              customer trust burned. Recovery is measured in weeks instead of
              hours.
            </p>
            <p className="font-semibold text-brand-ink">
              The fix isn&apos;t a bigger binder. It&apos;s an ISO 22301-aligned
              program — built around your real operations, tested against
              realistic scenarios, and maintained as your business changes.
            </p>
          </div>
        </Container>
      </section>

      {/* 4. Services */}
      <section className="section-warm py-20 sm:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              What We Do
            </p>
            <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
              Six service lines, one resilience program.
            </h2>
            <p className="mt-4 text-base text-brand-ink-mid">
              Engagements are typically delivered as a sequenced program but
              every service can be commissioned independently.
            </p>
          </div>

          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="surface-card group block h-full rounded-xl border border-brand-taupe-mid p-7 transition-colors hover:border-brand-orange"
                >
                  <h3 className="font-display text-xl text-brand-maroon">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                    {s.summary}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange transition-transform group-hover:translate-x-0.5">
                    Learn more <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 5. How it works */}
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              How It Works
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              A repeatable, ISO 22301-aligned engagement model.
            </h2>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step) => (
              <li
                key={step.n}
                className="rounded-xl border border-brand-paper/15 bg-brand-paper/5 p-6 backdrop-blur"
              >
                <div className="font-display text-3xl text-brand-orange">
                  {step.n}
                </div>
                <h3 className="mt-3 font-display text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-taupe">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* 6. Social proof — industries + team */}
      <section className="section-blush py-20 sm:py-24">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Industries Served
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                Trusted by leaders across regulated and operationally complex
                sectors.
              </h2>
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SITE.industries.map((i) => (
                  <li
                    key={i}
                    className="rounded-md border border-brand-taupe-mid bg-brand-paper px-4 py-3 text-center text-sm font-semibold text-brand-ink-mid"
                  >
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm uppercase tracking-[0.14em] text-brand-ink-light">
                Past Fortune 100 / 500 engagements include
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                {SITE.pastClients.join(" · ")}
              </p>
            </div>

            <aside className="rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Our Team
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-maroon">
                Practitioners, not generalists
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-brand-ink-mid">
                {SITE.team.experience}, including in-house and consulting
                leadership at major risk consultancies and Fortune 100 BCM
                functions. We bring that depth to SMBs that need
                enterprise-grade rigor without enterprise-scale overhead.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-brand-ink-mid">
                {SITE.team.certifications.map((c) => (
                  <li key={c.abbr}>
                    <span className="font-semibold text-brand-ink">
                      {c.abbr}
                    </span>{" "}
                    — {c.name}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline"
              >
                More about the firm <span aria-hidden>→</span>
              </Link>
            </aside>
          </div>
        </Container>
      </section>

      {/* 7. Final CTA */}
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Ready to find out where your continuity program stands?
          </h2>
          <p className="mt-4 text-base text-brand-taupe">
            Book a free 30-minute consultation. No sales pitch — a working call
            to map your gaps and recommend the right next step.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.label}
            </CtaButton>
            <CtaButton href="/contact" variant="ghost-on-dark">
              Other ways to reach us
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
