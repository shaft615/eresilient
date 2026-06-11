import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "riscScope™ — Enterprise Risk Assessment Platform",
  description:
    "riscScope™ is the enterprise risk assessment workspace in the RISC family from e|Resilient. ISO 22301:2019 and ISO/TS 22317:2021 aligned. Score 22 enterprise threats across five weighted impact dimensions, model inherent vs residual risk after controls, and produce a defensible threat register. Included with every paid e|Resilient engagement; available stand-alone for companies that want to assess their level of preparedness.",
  alternates: { canonical: `${SITE.url}/tools/risc-scope` },
};

const pillars = [
  {
    icon: "📐",
    title: "ISO-aligned methodology",
    summary:
      "Built on ISO 22301:2019 and ISO/TS 22317:2021 — the international standard for business continuity and the technical specification for Business Impact Analysis. Auditors and insurers recognize the framework on sight.",
    bullets: [
      "Enhanced model: five weighted impact dimensions and a control-effectiveness modifier",
      "Standard model: backwards-compatible 3-dimension scoring for legacy baselines",
      "Inherent vs residual Overall Threat Rating (OTR) on a 0–100 scale",
      "MTPD indicator captured at the threat level, not just the function",
    ],
  },
  {
    icon: "🎯",
    title: "Five impact dimensions",
    summary:
      "Most risk scoring collapses impact into one number. riscScope™ rates each threat across five weighted dimensions so the score reflects how the business actually fails — not a flat average.",
    bullets: [
      "Financial impact (1.5× weight) — direct loss and revenue exposure",
      "Operational impact (1.0×) — degradation, partial shutdown, full shutdown",
      "Reputational impact (1.25×) — local, regional, national attention",
      "Legal / regulatory (1.0×) — non-compliance, investigation, penalties",
      "Health & safety (1.5×) — first aid, treatment, serious injury, fatality",
    ],
  },
  {
    icon: "🛡",
    title: "Inherent vs residual risk",
    summary:
      "riscScope™ separates risk-before-controls from risk-after-controls so leadership can see what the program is actually buying. Controls become a measurable lever, not an article of faith.",
    bullets: [
      "Five-level control effectiveness scale (None → Full), 0–80% risk reduction",
      "Residual OTR rendered alongside inherent OTR for every threat",
      "Aggregate metric: average reduction across the threat register",
      "Risk-band classification: Low / Moderate / High / Critical",
    ],
  },
];

const howItWorks = [
  {
    title: "Configure the engagement",
    body: "Set the client organization, engagement name, assessment date, and lead assessor. Choose the Enhanced model (default — recommended) or Standard for backward compatibility with prior baselines.",
  },
  {
    title: "Score the threat catalog",
    body: "Step through 22 pre-loaded enterprise threats across Financial, Physical Hazard, External Environment, People & Workforce, Health & Safety, Security, Natural Disaster, Infrastructure, and Technology categories. Capture likelihood, weighted impacts, MTPD, and control effectiveness inline.",
  },
  {
    title: "Document controls and mitigations",
    body: "For each threat, capture management controls already in place, the mitigation strategy deployed, and the monitoring protocol. The qualitative narrative ships alongside the quantitative score — defensible to a board or auditor.",
  },
  {
    title: "Generate the threat register",
    body: "Results page ranks threats by residual OTR with a chart showing inherent vs residual side-by-side. Export to CSV for analysis, print to PDF for the engagement deliverable, and compare assessments year-over-year to see whether the program is moving.",
  },
];

const outputs = [
  "A ranked threat register with residual OTR scored 0–100 for every enterprise threat — defensible to a board, auditor, or customer due-diligence team",
  "Inherent vs residual OTR comparison: see what the existing controls are actually buying, expressed as a single risk-reduction percentage",
  "Five-dimension impact breakdown per threat (Financial, Operational, Reputational, Legal/Regulatory, Health & Safety) with weighted contribution",
  "MTPD indicator on every rated threat — the earliest unacceptable disruption timeframe, ready to feed into a continuity plan",
  "CSV export of the full register including likelihood, impacts, controls, mitigation strategy, and monitoring protocol",
  "Print-ready PDF deliverable formatted for executive review or ISO 22301 §8.2.3 documentation",
  "Year-over-year comparison view — overlay multiple assessments side-by-side to measure program maturity",
];

const threatCategories = [
  { name: "Financial", count: 2 },
  { name: "Physical Hazard", count: 2 },
  { name: "External Environment", count: 2 },
  { name: "People & Workforce", count: 2 },
  { name: "Health & Safety", count: 1 },
  { name: "Security", count: 2 },
  { name: "Natural Disaster", count: 5 },
  { name: "Infrastructure", count: 4 },
  { name: "Technology", count: 2 },
];

export default function RiscScopePage() {
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
            <span aria-hidden className="text-sm">📋</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              ISO 22301:2019 · ISO/TS 22317:2021
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            <span className="text-brand-orange">risc</span>Scope
            <sup className="ml-1 text-2xl text-brand-taupe/70">™</sup>
          </h1>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <span className="text-brand-paper">RISC</span> ·{" "}
            <span className="text-brand-taupe">Risk Intelligent Supply Chain</span>
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            riscScope™ is the enterprise risk assessment workspace in the
            RISC family from e|Resilient. Five weighted impact dimensions,
            inherent-vs-residual modeling, control effectiveness as a
            measurable lever — and an output your board, your insurer, and
            your customers&apos; due-diligence teams will all recognize.
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
              href="/tools"
              className="font-semibold text-brand-orange hover:underline"
            >
              riscManager.com™
            </Link>
            , our Risk Intelligent Supply Chain platform. The family also
            includes{" "}
            <Link
              href="/tools/risc-analysis"
              className="font-semibold text-brand-orange hover:underline"
            >
              riscAnalysis™
            </Link>{" "}
            (Business Impact Analysis). riscScope™ extends the same
            disciplined methodology beyond supply chain to enterprise-
            wide threat assessment — same standard, same rigor, same
            workspace family.
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
            Most companies cannot defend their risk register.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-ink-mid">
            <p>
              Walk into the average SMB and ask for their enterprise risk
              register and you&apos;ll get one of three answers: a heatmap
              that someone built once in a workshop, a spreadsheet that
              hasn&apos;t been updated since the last audit, or a polite
              shrug. None of those survive a serious question from a board,
              an insurer, or a regulator.
            </p>
            <p>
              The standard exists for a reason. ISO 22301 §8.2.3 expects
              identified threats, assessed likelihood and impact,
              documented controls, and a measurable residual exposure.
              ISO/TS 22317:2021 specifies how to do the assessment work
              behind it. The methodology is settled — what&apos;s missing
              for most SMBs is a workspace that makes following it
              practical.
            </p>
            <p className="font-semibold text-brand-ink">
              riscScope™ is that workspace. Score the threats the way the
              standard says to score them, document the controls already
              in place, and produce a register that holds up under
              scrutiny — without a six-month Big Four engagement to get
              there.
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
              The three things that make a risk score defensible.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
              Most tools collapse risk into a single number on a heatmap.
              riscScope™ separates the inputs the standard cares about so
              the output can be audited, challenged, and updated as the
              business changes.
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

      {/* Threat catalog */}
      <section className="bg-brand-taupe-light/60 py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            The Threat Catalog
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            22 enterprise threats, pre-loaded.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            You don&apos;t start from a blank threat list. riscScope™ ships
            with the 22 enterprise threats e|Resilient practitioners have
            seen recur across two decades of Fortune 100 work — from
            cash-flow crunch to wildfire to communications failure. Each
            one is pre-described so you score, you don&apos;t brainstorm.
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {threatCategories.map((c) => (
              <li
                key={c.name}
                className="rounded-md border border-brand-taupe-mid bg-brand-paper px-4 py-3 text-sm"
              >
                <div className="font-semibold text-brand-ink">{c.name}</div>
                <div className="text-xs text-brand-ink-light">
                  {c.count} {c.count === 1 ? "threat" : "threats"}
                </div>
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
              From kickoff to defensible register.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-taupe">
              Four steps. Auto-saved at every input. Resume from any
              device, any time.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-2">
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
            Outputs that travel.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            Everything riscScope™ produces is portable and human-readable.
            Hand the CSV to a data team, the PDF to a board, and the
            register to your insurer — same source of truth, no
            reformat-and-reconcile.
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
              riscScope™ lives inside the e|Resilient client workspace.
              Most clients reach it through a paid engagement; companies
              that just want to gauge their own preparedness can license
              it stand-alone.
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
                riscScope™ as part of the client workspace. Your consultant
                runs the assessment alongside your BIA, supply chain
                mapping, and continuity planning — no separate purchase,
                no separate platform.
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
                For companies assessing their own preparedness
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                If you&apos;re not ready for a full engagement but want to
                produce a defensible threat register, riscScope™ is
                available as a stand-alone subscription. You run the
                assessment yourself; we&apos;re available for methodology
                questions and an optional practitioner review.
              </p>
              <div className="mt-6">
                <CtaButton href="/contact?topic=risc-scope">
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
            Stop hand-waving the risk register.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-taupe">
            Schedule a 30-minute consultation. We&apos;ll show you the
            workspace, walk through the methodology, and figure out which
            access path fits your situation.
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
