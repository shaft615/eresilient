import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "e|Resilient is a boutique business continuity consultancy serving SMBs across manufacturing, healthcare, financial services, and logistics. Over 30 years of practical and consulting experience in BCM and supply chain risk, delivered without the Big Four overhead.",
  alternates: { canonical: `${SITE.url}/about` },
};

const principles = [
  {
    title: "Translation, not jargon",
    body: "BCM has its own language — RTO, RPO, MTPD, BIA, ISO 22301. Our job is to turn that into decisions business owners can actually make. Process details get translated into plain language; the rigor stays under the hood.",
  },
  {
    title: "Built for the way SMBs operate",
    body: "Big-firm methodologies designed for global enterprises don't survive contact with a 50-person company. Our engagements are scaled to your team, your budget, and your risk profile — not what looks impressive on a slide.",
  },
  {
    title: "Aligned to ISO 22301",
    body: "Every program we build maps to the international standard for business continuity. That gives you a credible framework for auditors, insurers, and customer due-diligence — and a clear maturity path as the program grows.",
  },
  {
    title: "High-touch, technology-leveraged",
    body: "Plans live where teams actually work — secure SharePoint deployments, mobile, paper backups. Active monitoring options for supply chain. Not another binder destined for a shelf.",
  },
];

const teamDepth = [
  "In-house and consulting leadership at major risk consultancies — including Senior Vice President / Senior Managing Consultant roles and Director-level business continuity practice leadership",
  "Hands-on engagement with Fortune 100 manufacturers, retailers, financial institutions, and healthcare organizations across more than two decades",
  "Real-event experience including pandemic preparedness program leadership and Hurricane Katrina / Rita recovery operations",
  "Custom BCM platform development, including production-capacity databases for supply chain risk integration",
  "Recognized sales and delivery leadership across multiple years (2009–2017) for Fortune 500 BCM consulting engagements",
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-28">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            About {SITE.name}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            {SITE.slogan}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            {SITE.legalName} is a boutique business continuity consultancy.
            We&apos;ve mastered the skill of business continuity planning over
            decades of work with Fortune 100 firms — and we bring that
            expertise to small and mid-sized companies that have outgrown
            checklists but can&apos;t justify a Big Four engagement.
          </p>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            What We Believe
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            Resilience is engineered, not assembled.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            Our main objective is the protection of your business. We build
            integrated continuity, crisis, emergency response, and supply chain
            programs that hold up when tested — because the test eventually
            arrives whether you&apos;re ready or not.
          </p>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2">
            {principles.map((p) => (
              <li
                key={p.title}
                className="rounded-xl border border-brand-taupe-mid bg-brand-paper p-6"
              >
                <h3 className="font-display text-lg text-brand-maroon">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-taupe-light/60 py-20 sm:py-24">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                The Team
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                Practitioners with depth.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-brand-ink-mid">
                {SITE.team.experience}. The people delivering your engagement
                are the people who built BCM programs at major risk
                consultancies and inside Fortune 100 firms — not associates
                running a templated playbook.
              </p>
              <ul className="mt-6 space-y-3">
                {teamDepth.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-brand-ink-mid"
                  >
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ▸
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
                <h3 className="font-display text-lg text-brand-maroon">
                  Certifications held by the team
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-brand-ink-mid">
                  {SITE.team.certifications.map((c) => (
                    <li key={c.abbr}>
                      <span className="font-semibold text-brand-ink">
                        {c.abbr}
                      </span>{" "}
                      — {c.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
                <h3 className="font-display text-lg text-brand-maroon">
                  Federal Registration
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-brand-ink-mid">
                  <li>
                    <span className="font-semibold text-brand-ink">DUNS:</span>{" "}
                    {SITE.federal.duns}
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">
                      CAGE Code:
                    </span>{" "}
                    {SITE.federal.cage}
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">EIN:</span>{" "}
                    {SITE.federal.ein}
                  </li>
                  <li>
                    <span className="font-semibold text-brand-ink">NAICS:</span>{" "}
                    {SITE.federal.naics.join(", ")}
                  </li>
                </ul>
                <p className="mt-4 text-xs text-brand-ink-light">
                  Registered with SAM.gov for federal contracting opportunities.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Have a continuity question?
          </h2>
          <p className="mt-4 text-base text-brand-taupe">
            Book a free 30-minute call or reach us through any channel that
            works for you.
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
