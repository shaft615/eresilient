import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { JsonLd } from "@/components/json-ld";
import { founderSchema } from "@/lib/structured-data";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.founder.name} — ${SITE.founder.role}`,
  description: `${SITE.founder.name}, MBCP, MBCI, CBCLA, PMP — Managing Principal at e|Resilient with 25+ years of business continuity leadership at Marsh Risk Consulting and Aon Corporation, serving Fortune 100 manufacturing, retail, finance, and healthcare clients.`,
  alternates: { canonical: `${SITE.url}/about/karl` },
};

const career = [
  {
    period: "2006 – Present",
    company: "Marsh USA / Marsh Risk Consulting",
    location: "Chicago, IL",
    role: "Senior Vice President · Senior Managing Consultant",
    body: "Led BCM consulting engagements across Fortune 500 manufacturing, retail, finance, and healthcare clients. Drove business development for the Midwest practice; recognized as Leading Producer for 2009, 2010, 2011, 2013, 2015, 2016, and 2017. Built and led custom BCM solutions including a production-capacity database for a Fortune 100 manufacturer integrating supply chain risk into continuity planning.",
  },
  {
    period: "2004 – 2006",
    company: "Aon Corporation",
    location: "Chicago, IL",
    role: "Director of Business Continuity",
    body: "Held global accountability for situation response and BCM at Aon's worldwide locations — including BCP/DR plan development and templates for offices across North, Central, and South America. Appointed leader of the Pandemic Flu Advisory Task Force and recognized as the firm's lead client advisor for pandemic preparedness in the Americas. Spearheaded recovery efforts for Hurricanes Katrina and Rita.",
  },
  {
    period: "1995 – 2004",
    company: "Aon Corporation",
    location: "Chicago, IL",
    role: "BCM Practitioner & Manager (multiple roles)",
    body: "Built and managed Aon's business continuity documentation worldwide, leading development of a custom Lotus Notes database that replaced legacy systems with projected savings of $750,000. Implemented incident-reporting infrastructure that became a source of intelligence for adjacent divisions.",
  },
];

const competencies = [
  "Business Continuity & Disaster Recovery",
  "Risk Assessment & Analysis",
  "Supply Chain Risk Management",
  "Crisis Identification & Management",
  "Recovery Solution Development",
  "Network & Systems Security",
  "Process Engineering & Reengineering",
  "Technology / Business Policy Development",
];

export default function KarlPage() {
  return (
    <>
      <JsonLd data={founderSchema()} />

      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-28">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            {SITE.founder.role}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {SITE.founder.name}
          </h1>
          <p className="mt-3 text-base font-semibold uppercase tracking-[0.14em] text-brand-taupe">
            MBCP · MBCI · CBCLA · PMP
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            Business continuity executive, manager, and consulting specialist
            with a distinguished career leading complex BCM and IT initiatives
            for industry-leading firms. Karl founded {SITE.legalName} to bring
            the rigor of Fortune 100 continuity practice to the small and
            mid-sized companies that need it most.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <CtaButton href={SITE.calendly} external>
              Book time with Karl
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

      <section className="py-20 sm:py-24">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                Career
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                Two decades at the world&apos;s leading risk consultancies.
              </h2>

              <ol className="mt-10 space-y-10 border-l-2 border-brand-taupe-mid pl-6">
                {career.map((c) => (
                  <li key={`${c.company}-${c.period}`} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-brand-orange ring-4 ring-brand-paper"
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink-light">
                      {c.period}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-brand-maroon">
                      {c.company}
                    </h3>
                    <p className="text-sm font-semibold text-brand-ink">
                      {c.role}
                    </p>
                    <p className="text-xs uppercase tracking-[0.1em] text-brand-ink-faint">
                      {c.location}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                      {c.body}
                    </p>
                  </li>
                ))}
              </ol>

              <h3 className="mt-16 font-display text-xl text-brand-maroon">
                Education
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                Executive MBA · MS in Management of Technology
              </p>
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6">
                <h3 className="font-display text-lg text-brand-maroon">
                  Certifications
                </h3>
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
              </div>

              <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-6">
                <h3 className="font-display text-lg text-brand-maroon">
                  Core Competencies
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-brand-ink-mid">
                  {competencies.map((c) => (
                    <li key={c} className="flex gap-2">
                      <span aria-hidden className="text-brand-orange">
                        ▸
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-brand-maroon bg-brand-maroon p-6 text-brand-paper">
                <h3 className="font-display text-lg">Direct Contact</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <a
                      href={SITE.contact.phoneHref}
                      className="hover:text-brand-orange"
                    >
                      {SITE.contact.phone}
                    </a>
                  </li>
                  <li>
                    <a
                      href={SITE.contact.emailHref}
                      className="hover:text-brand-orange"
                    >
                      {SITE.contact.email}
                    </a>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
