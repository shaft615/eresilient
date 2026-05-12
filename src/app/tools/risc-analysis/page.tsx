import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "riscAnalysis™ — Business Impact Analysis Platform",
  description:
    "riscAnalysis™ is the Business Impact Analysis workspace in the RISC family from e|Resilient. ISO 22301:2019 §8.2.2 and ISO/TS 22317:2021 aligned. Inventory critical activities, quantify recovery objectives (RTO, RPO, MBCO, MTPD), map dependencies, and produce a defensible BIA report. Included with every paid e|Resilient engagement; available stand-alone for companies that want to build the BIA foundation themselves.",
  alternates: { canonical: `${SITE.url}/tools/risc-analysis` },
};

const pillars = [
  {
    icon: "🎯",
    title: "Critical activity inventory",
    summary:
      "BIA starts with knowing what actually matters. riscAnalysis™ structures the discovery so every revenue-generating, compliance-bound, and customer-facing process gets captured — not just the ones leadership remembers in the workshop.",
    bullets: [
      "Activity catalog organized by department, function, or value stream",
      "Criticality tier classification (Tier 1 / Tier 2 / Tier 3 / Non-critical)",
      "Process owners, deputies, and escalation paths captured per activity",
      "Plain-language process descriptions readable by non-practitioners",
    ],
  },
  {
    icon: "⏱",
    title: "Recovery objectives, quantified",
    summary:
      "The four numbers every continuity program needs and most cannot defend: RTO, RPO, MBCO, MTPD. riscAnalysis™ captures them per activity with the impact-over-time analysis that makes them defensible to an auditor.",
    bullets: [
      "RTO — Recovery Time Objective (how fast must it resume)",
      "RPO — Recovery Point Objective (how much data loss is acceptable)",
      "MBCO — Minimum Business Continuity Objective (degraded but acceptable)",
      "MTPD — Maximum Tolerable Period of Disruption (when does it become existential)",
    ],
  },
  {
    icon: "🔗",
    title: "Dependencies mapped",
    summary:
      "An activity doesn't fail in isolation — it fails because something upstream failed. riscAnalysis™ captures the dependency chain so recovery planning targets the actual constraints, not just the visible process.",
    bullets: [
      "People dependencies — roles, headcount, named successors",
      "Technology dependencies — applications, infrastructure, data feeds",
      "Supplier dependencies — vendors, contracts, sole-source flags",
      "Facility & equipment dependencies — sites, machinery, utilities",
    ],
  },
];

const howItWorks = [
  {
    title: "Configure the engagement",
    body: "Set the client organization, BIA cycle (initial / annual refresh / post-incident review), scope boundaries (whole company / business unit / site), and the lead analyst. Multi-site engagements roll up per-site BIAs into a consolidated view.",
  },
  {
    title: "Discover the activities",
    body: "Walk through each function and capture the critical activities with process owners, descriptions, and supporting evidence. Bulk-import from existing org charts or process inventories via CSV — no greenfield list-building required if the data already exists.",
  },
  {
    title: "Quantify the recovery objectives",
    body: "For each activity, capture the four recovery objectives with their underlying rationale and the impact-over-time analysis. The workspace flags inconsistencies (e.g., an RTO shorter than the dependency's RTO) so the numbers stay defensible end-to-end.",
  },
  {
    title: "Map dependencies and gaps",
    body: "Link each activity to the people, technology, suppliers, and facilities it depends on. The workspace surfaces gaps automatically — activities with no documented backup, dependencies with no recovery strategy, RTOs that conflict with current capability.",
  },
  {
    title: "Generate the BIA report",
    body: "Output is a complete BIA report ready for ISO 22301 §8.2.2 documentation — prioritized activity register, recovery objectives table, dependency analysis, gap summary, and recommendations. Print to PDF for the engagement deliverable, export to CSV for downstream planning.",
  },
];

const outputs = [
  "Prioritized critical activity register with criticality tier, owner, and recovery objectives — defensible to a board, auditor, or customer due-diligence team",
  "RTO / RPO / MBCO / MTPD captured per activity with impact-over-time analysis underneath each number",
  "Complete dependency map: people, technology, suppliers, facilities — with sole-source flags surfaced inline",
  "Gap analysis: activities without documented backups, dependencies without recovery strategies, RTO conflicts across the chain",
  "BIA report formatted to ISO 22301:2019 §8.2.2 documentation requirements, print-ready PDF",
  "CSV export of the full activity register and dependency map, ready to feed into continuity planning",
  "Year-over-year comparison view — overlay multiple BIA cycles to see whether the program is maturing",
];

export default function RiscAnalysisPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-maroon text-brand-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(251,92,1,0.22) 0%, transparent 70%)",
          }}
        />
        <Container width="wide" className="relative py-20 sm:py-24 lg:py-28">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange hover:underline"
          >
            <span aria-hidden>←</span> Tools
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1.5">
            <span aria-hidden className="text-sm">📊</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              ISO 22301:2019 §8.2.2 · ISO/TS 22317:2021
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            <span className="text-brand-orange">risc</span>Analysis
            <sup className="ml-1 text-2xl text-brand-taupe/70">™</sup>
          </h1>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <span className="text-brand-paper">RISC</span> ·{" "}
            <span className="text-brand-taupe">Risk Intelligent Supply Chain</span>
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            riscAnalysis™ is the Business Impact Analysis workspace in the
            RISC family from e|Resilient. Inventory critical activities,
            quantify recovery objectives (RTO, RPO, MBCO, MTPD), map the
            dependency chain — and produce the BIA report that becomes
            the foundation every other continuity decision rests on.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton href={SITE.calendly} external>
              Request access
            </CtaButton>
            <CtaButton href="#access" variant="ghost-on-dark">
              How to get access
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* RISC family note */}
      <section className="border-b border-brand-taupe-mid/40 bg-brand-paper py-10">
        <Container width="narrow">
          <p className="text-sm leading-relaxed text-brand-ink-mid">
            <span className="font-semibold text-brand-ink">
              The RISC family.
            </span>{" "}
            The lowercase &ldquo;risc&rdquo; prefix is shared across our
            tools and originates with{" "}
            <Link
              href="/products/risc-manager"
              className="font-semibold text-brand-orange hover:underline"
            >
              riscManager.com™
            </Link>
            , our Risk Intelligent Supply Chain platform. riscAnalysis™
            sits at the foundation of the family — the BIA whose
            recovery objectives drive every other workspace, including{" "}
            <Link
              href="/tools/risc-scope"
              className="font-semibold text-brand-orange hover:underline"
            >
              riscScope™
            </Link>
            &apos;s threat-level controls and riscManager.com™&apos;s
            supply chain recovery posture.
          </p>
        </Container>
      </section>

      {/* Problem */}
      <section className="bg-brand-taupe-light/60 py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            Why It Exists
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            Every continuity plan rests on a BIA that doesn&apos;t exist.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-ink-mid">
            <p>
              Ask a continuity team what their RTO is for order-to-cash
              and you&apos;ll usually get a number. Ask them how the
              number was derived and you&apos;ll usually get silence.
              The BIA — the analysis that&apos;s supposed to justify
              every recovery objective in the plan — is the document
              every audit asks for and almost nobody can produce.
            </p>
            <p>
              The reason is simple: doing BIA properly is tedious. It
              means cataloging every critical activity, capturing four
              recovery objectives per activity with rationale, mapping
              dependencies in four directions (people / technology /
              suppliers / facilities), and keeping it all consistent as
              the business changes. Without a workspace built for it,
              the work falls back to spreadsheets that decay within
              months of the consultant leaving.
            </p>
            <p className="font-semibold text-brand-ink">
              riscAnalysis™ is the workspace that makes the BIA
              continuously maintainable. Capture the analysis the way
              ISO 22301 §8.2.2 expects to see it, surface the gaps as
              the business changes, and produce the report that holds
              up under scrutiny — every refresh cycle, not just at
              kickoff.
            </p>
          </div>
        </Container>
      </section>

      {/* Three pillars */}
      <section className="py-20 sm:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              What It Does
            </p>
            <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
              The three jobs every defensible BIA has to do.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
              ISO 22301 §8.2.2 reads as three sentences, but each one
              hides weeks of analysis. riscAnalysis™ structures the
              capture so the output meets the standard without the
              months-long binder build that usually accompanies it.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <li
                key={p.title}
                className="flex h-full flex-col rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7"
              >
                <div className="font-display text-4xl">{p.icon}</div>
                <h3 className="mt-4 font-display text-xl text-brand-maroon">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                  {p.summary}
                </p>
                <ul className="mt-5 space-y-2">
                  {p.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2 text-xs leading-relaxed text-brand-ink-mid"
                    >
                      <span aria-hidden className="mt-0.5 text-brand-orange">
                        ▸
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it works */}
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              How It Works
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Five steps from kickoff to BIA report.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-taupe">
              Auto-saved at every input. Resume from any device. Multi-
              tenant: each client gets an isolated workspace.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {howItWorks.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl border border-brand-paper/15 bg-brand-paper/5 p-7"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
                  Step {i + 1}
                </div>
                <h3 className="mt-3 font-display text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-taupe">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Outputs */}
      <section className="py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            What You Get
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            The BIA report — and the live workspace behind it.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            The BIA report is the deliverable. The workspace is what
            keeps it accurate between refresh cycles. Both ship from the
            same source of truth, so the report your auditor sees and
            the dashboard your continuity team works from never drift
            apart.
          </p>

          <ul className="mt-10 space-y-4">
            {outputs.map((o) => (
              <li key={o} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-bold text-brand-orange"
                >
                  ✓
                </span>
                <span className="text-base leading-relaxed text-brand-ink-mid">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Access paths */}
      <section
        id="access"
        className="bg-brand-taupe-light/60 py-20 sm:py-24"
      >
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              How to Get Access
            </p>
            <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
              Two paths in.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
              riscAnalysis™ lives inside the e|Resilient client
              workspace. Most clients reach it through a paid
              engagement; companies that want to run their own BIA can
              license it stand-alone.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="flex h-full flex-col rounded-2xl border border-brand-taupe-mid bg-brand-paper p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Path 1 · Bundled
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-maroon">
                Included in every paid engagement
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                Every e|Resilient client engagement includes access to
                riscAnalysis™ as part of the client workspace. Your
                consultant runs the BIA alongside riscScope™, supply
                chain mapping, and continuity planning — no separate
                purchase, no separate platform.
              </p>
              <div className="mt-6">
                <CtaButton href={SITE.calendly} external>
                  Schedule a consultation
                </CtaButton>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-brand-taupe-mid bg-brand-paper p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Path 2 · Stand-alone
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-maroon">
                For companies running their own BIA
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                If you have an in-house continuity function and want a
                purpose-built BIA workspace rather than a spreadsheet,
                riscAnalysis™ is available as a stand-alone
                subscription. You run the analysis yourself; we&apos;re
                available for methodology questions and an optional
                practitioner review.
              </p>
              <div className="mt-6">
                <CtaButton href="/contact?topic=risc-analysis">
                  Request stand-alone access
                </CtaButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Stop building plans on top of a BIA that doesn&apos;t exist.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-taupe">
            Schedule a 30-minute consultation. We&apos;ll show you the
            workspace, walk through the methodology, and figure out
            which access path fits your situation.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.short}
            </CtaButton>
            <CtaButton href="/tools" variant="ghost-on-dark">
              Back to Tools
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
