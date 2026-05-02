import type { Metadata } from "next";
import { Container } from "@/components/container";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "BCP Readiness Scorecard — ISO 22301-Aligned Self-Assessment",
  description:
    "Self-assess your business continuity program across 8 ISO 22301-aligned domains and 42 questions. Get an instant scorecard with maturity band, radar visualization, and prioritized gap analysis. Free for SMB leaders.",
  alternates: { canonical: `${SITE.url}/resources/bcp-readiness-scorecard` },
};

const domains = [
  { id: "D1", short: "Governance", icon: "⚖️" },
  { id: "D2", short: "Risk Assessment", icon: "🎯" },
  { id: "D3", short: "BIA", icon: "📊" },
  { id: "D4", short: "BC Strategy", icon: "🗺️" },
  { id: "D5", short: "Plans & Docs", icon: "📋" },
  { id: "D6", short: "Training", icon: "🎓" },
  { id: "D7", short: "Exercising", icon: "🧪" },
  { id: "D8", short: "Improvement", icon: "📈" },
];

export default function ScorecardLandingPage() {
  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Free Lead Magnet · ISO 22301-Aligned
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            BCP Readiness Scorecard.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            42 questions across 8 BCM domains. ~20 minutes. Instant scorecard
            with maturity band, radar visualization, and prioritized gap
            analysis. Built by a Master Business Continuity Professional with
            25+ years of Fortune 100 practice.
          </p>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                What You&apos;ll Get
              </p>
              <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
                A defensible read on your continuity program — in 20 minutes.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
                The scorecard walks through 42 questions across 8 ISO
                22301-aligned domains. Each question maps to a specific
                evidence anchor — not vibes — so the resulting maturity score
                is something you can show your board, your auditor, or your
                largest customer.
              </p>

              <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {domains.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded-md border border-brand-taupe-mid bg-brand-paper px-3 py-2 text-xs font-semibold text-brand-ink-mid"
                  >
                    <span aria-hidden>{d.icon}</span>
                    <span>{d.short}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 font-display text-xl text-brand-maroon">
                When you finish, you&apos;ll have:
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-brand-ink-mid">
                {[
                  "An overall BCM maturity score (Critical / Developing / Established / Advanced / Optimized)",
                  "A radar chart showing relative strength across all 8 domains",
                  "A prioritized list of the 3 weakest domains — your highest-leverage next moves",
                  "Question-level detail with notes you can save or print as PDF",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-1 text-brand-orange">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-xs uppercase tracking-[0.14em] text-brand-ink-light">
                Built by
              </p>
              <p className="mt-2 text-base text-brand-ink-mid">
                <span className="font-semibold text-brand-ink">
                  {SITE.founder.name}
                </span>
                , {SITE.founder.role} ·{" "}
                <span className="text-sm text-brand-ink-light">
                  MBCP · MBCI · CBCLA · PMP
                </span>
              </p>
            </div>

            <aside className="rounded-2xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Get the scorecard
              </p>
              <h2 className="mt-2 font-display text-2xl text-brand-maroon">
                Send me the link
              </h2>
              <p className="mt-2 text-sm text-brand-ink-mid">
                We&apos;ll email it to you immediately and forward you straight
                to the assessment.
              </p>
              <div className="mt-6">
                <LeadCaptureForm source="bcp-readiness-scorecard" />
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
