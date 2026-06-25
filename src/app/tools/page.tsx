import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { RiscWordmark, RiscText } from "@/components/risc-wordmark";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tools — practitioner workspaces for business continuity",
  description:
    "Purpose-built workspaces e|Resilient uses to deliver engagements — and that clients use between engagements. Risk Assessment, riscManager (supply chain), and the BCP Readiness Scorecard.",
  alternates: { canonical: `${SITE.url}/tools` },
};

const tools = [
  {
    name: "riscAnalysis™",
    badge: "ISO 22301 §8.2.2 · ISO/TS 22317:2021",
    summary:
      "The Business Impact Analysis workspace in the RISC family. Inventory critical activities, quantify recovery objectives (RTO, RPO, MBCO, MTPD), and map dependencies across people, technology, suppliers, and facilities. The BIA every other continuity decision rests on.",
    bullets: [
      "Critical activity register with criticality tier and process owner",
      "Four recovery objectives (RTO, RPO, MBCO, MTPD) captured per activity",
      "Dependency map across people, technology, suppliers, facilities",
      "ISO 22301 §8.2.2 compliant BIA report + CSV + year-over-year comparison",
    ],
    href: "/tools/risc-analysis",
    cta: "Explore riscAnalysis™",
    status: "available",
  },
  {
    name: "riscScope™",
    badge: "ISO 22301 · ISO/TS 22317:2021",
    summary:
      "The enterprise risk assessment workspace in the RISC family. Score 22 enterprise threats across five weighted impact dimensions, model inherent vs residual risk after controls, and produce a defensible threat register the board, the auditor, and the insurer will all recognize.",
    bullets: [
      "Enhanced 0–100 OTR scoring model with control-effectiveness modifier",
      "22 pre-loaded enterprise threats across 9 categories",
      "Inherent vs residual comparison with MTPD indicator",
      "CSV export + print-ready PDF + year-over-year comparison",
    ],
    href: "/tools/risc-scope",
    cta: "Explore riscScope™",
    status: "available",
  },
  {
    name: "riscResponse™",
    badge: "ISO 22301 §8.4 · ISO 22320",
    summary:
      "The incident response and activation workspace in the RISC family. When a disruption hits, declare the incident, activate the right response and continuity plans, coordinate the team from one source of truth, and capture every decision in a time-stamped log the after-action review and the auditor will both recognize.",
    bullets: [
      "Incident declaration with severity classification and activation authority",
      "One-click plan activation with role-based action checklists and a live status board",
      "Time-stamped decision and event log captured automatically through the response",
      "After-action report with corrective actions, ready for the next exercise cycle",
    ],
    href: "/tools/risc-response",
    cta: "Explore riscResponse™",
    status: "in-development",
  },
  {
    name: "riscManager.com™",
    badge: "Risk Intelligent Supply Chain",
    summary:
      "The operating layer for a Risk Intelligent Supply Chain. Inventory every product by recovery posture (Can / Could / Cannot), map suppliers down to raw materials, and surface sole-source dependencies with mitigation plans attached.",
    bullets: [
      "Product-level recovery category (Can / Could / Cannot)",
      "Supply chain mapping: raw materials and semi-finished inputs to source",
      "Sole-source risk watch with mandatory mitigation plans",
      "Multi-tenant: each client gets an isolated workspace",
    ],
    href: SITE.calendly,
    external: true,
    cta: "Join the waitlist",
    status: "in-development",
  },
  {
    name: "BCP Readiness Scorecard",
    badge: "Free · No engagement required",
    featured: true,
    summary:
      "A 42-question self-assessment that benchmarks your current continuity program against ISO 22301. Get an instant scorecard with a maturity band, radar visualization, and prioritized gap analysis.",
    bullets: [
      "Free to use — no consultation required",
      "42 questions across 8 domains, about 20 minutes",
      "Instant results with maturity band and gap analysis",
      "Optional follow-up: practitioner walkthrough of your results",
    ],
    href: "/scorecard",
    cta: "Take the scorecard",
    status: "available",
  },
];

export default function ToolsIndexPage() {
  return (
    <>
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="wide">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Tools
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl">
            Practitioner workspaces — not generic SaaS.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            Every tool here is something e|Resilient practitioners actually
            use to deliver engagements. They&apos;re purpose-built for the
            way BCM work flows — ISO-aligned, defensible, and scaled to SMB
            realities. Most are bundled with a paid engagement; some are
            available stand-alone.
          </p>
        </Container>
      </section>

      <section className="section-warm py-20 sm:py-24">
        <Container width="wide">
          <ul className="grid gap-6 md:grid-cols-2">
            {tools.map((t) => (
              <li
                key={t.name}
                className="surface-card flex h-full flex-col rounded-2xl border border-brand-taupe-mid p-8"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      t.featured
                        ? "inline-flex items-center rounded-full border border-brand-orange bg-brand-orange px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm"
                        : "inline-flex items-center rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange"
                    }
                  >
                    {t.badge}
                  </span>
                  {t.status === "in-development" && (
                    <span className="inline-flex items-center rounded-full border border-brand-taupe-mid bg-brand-taupe-light/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light">
                      In development
                    </span>
                  )}
                </div>

                <h2 className="mt-5 font-display text-2xl text-brand-maroon">
                  <RiscWordmark name={t.name} />
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-brand-ink-mid">
                  {t.summary}
                </p>

                <ul className="mt-5 space-y-2">
                  {t.bullets.map((b) => (
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

                <div className="mt-7 flex-1" />

                {t.external ? (
                  <a
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-orange hover:underline"
                  >
                    <RiscText>{t.cta}</RiscText> <span aria-hidden>→</span>
                  </a>
                ) : t.featured ? (
                  <CtaButton href={t.href} className="self-start">
                    {t.cta}
                  </CtaButton>
                ) : (
                  <Link
                    href={t.href}
                    className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-orange hover:underline"
                  >
                    <RiscText>{t.cta}</RiscText> <span aria-hidden>→</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Not sure which one fits?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-taupe">
            Schedule a 30-minute consultation. We&apos;ll walk through
            where your program sits today and which workspace would move
            it forward fastest.
          </p>
          <div className="mt-9">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.short}
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
