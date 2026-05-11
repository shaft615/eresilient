import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { RiscManagerWaitlistForm } from "@/components/risc-manager-waitlist-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "riscManager.com™ — Supply Chain Risk Operating Layer",
  description:
    "Inventory every product by recovery readiness, map supply chains down to raw-material sources, and manage sole-source risk in one purpose-built SaaS workspace. Currently in development; bundled with e|Resilient Program and Enterprise engagements.",
  alternates: { canonical: `${SITE.url}/products/risc-manager` },
};

const pillars = [
  {
    icon: "📊",
    title: "Product Recovery Posture",
    summary:
      "For every product in your portfolio, riscManager captures whether you Can recover, Could recover with effort, or Cannot recover — with RTO and MTPD documented and defensible.",
    bullets: [
      "Recovery category (Can / Could / Cannot) per SKU",
      "RTO and MTPD captured at the product level, not just the function",
      "On-site inventory and broader supply-chain inventory tracked separately",
      "Partial-outage and total-outage recovery strategies side by side",
    ],
  },
  {
    icon: "🌐",
    title: "Supply Chain Mapping",
    summary:
      "Each product traces back to its raw materials and semi-finished inputs, each with multiple supplier sources — with full supplier contact details and address on file.",
    bullets: [
      "Raw materials linked to one or more supplier sources",
      "Semi-finished inputs treated the same way (no second-class data)",
      "Full supplier addresses and contact details, not just names",
      "Customer contact details captured for emergency notification",
    ],
  },
  {
    icon: "🚨",
    title: "Sole-Source Risk Watch",
    summary:
      "Single-source dependencies are the most-cited cause of supply chain failure and the least-tracked. riscManager surfaces them on the dashboard and forces a mitigation plan against each.",
    bullets: [
      "Flag any supplier as sole-source with one click",
      "Inline mitigation strategy field per sole-source dependency",
      "Dashboard rollup of sole-source exposure across the portfolio",
      "Historical context field for institutional knowledge ('we tried X in 2022 and...')",
    ],
  },
];

const howItWorks = [
  {
    title: "Multi-tenant by design",
    body: "Each client gets its own isolated workspace. Your team sees your data; consultants you grant access can collaborate inside that workspace without ever seeing another client.",
  },
  {
    title: "Web-based, no install",
    body: "Sign in from any browser. CSV import templates let you bulk-load existing supplier and product data on day one — no migration project.",
  },
  {
    title: "Dashboard-led",
    body: "Open the workspace and immediately see Product Family count, Total Products, Can Recover, and Cannot Recover. Product Families list shows where your concentration sits at a glance.",
  },
  {
    title: "Built for the e|Resilient methodology",
    body: "Every field maps to a question Karl's team has been asking SMB supply chain leaders for two decades. The data model isn't generic — it's purpose-built for Business Impact Analysis at the product level.",
  },
];

const outputs = [
  "A queryable register of every product's recovery readiness — defensible to a board, an auditor, or a customer due-diligence team",
  "Supplier list with full contact details and addresses — ready to use when a real disruption hits",
  "Documented sole-source dependencies with mitigation plans attached, surfaced on the dashboard",
  "Per-product RTO and MTPD, ready to plug into a continuity plan or insurance application",
  "Customer contact list with full details for emergency notification",
  "BIA-style outputs that satisfy ISO 22301 §8.2.2 requirements at the product layer",
];

export default function RiscManagerPage() {
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
            href="/services/supply-chain-risk"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange hover:underline"
          >
            <span aria-hidden>←</span> Supply Chain Risk Service
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1.5">
            <span aria-hidden className="text-sm">🛠</span>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
              In development · Early access by request
            </span>
          </div>

          <h1 className="mt-6 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            <span className="text-brand-orange">risc</span>Manager
            <span className="font-normal text-brand-taupe">.com</span>
            <sup className="ml-1 text-2xl text-brand-taupe/70">™</sup>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            The supply chain risk operating layer for SMBs. Inventory every
            product by recovery readiness, map the supply chain down to
            raw-material sources, and manage sole-source dependencies — in one
            purpose-built workspace.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton href="#request-access">
              Request early access
            </CtaButton>
            <CtaButton href="#how-it-powers" variant="ghost-on-dark">
              How it powers our consulting
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* Problem */}
      <section className="bg-brand-taupe-light/60 py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            Why It Exists
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            Most companies discover their supply-chain answer the wrong way.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-ink-mid">
            <p>
              When a critical supplier fails, every company finds out one of
              three things: they <strong>Can</strong> recover (a backup exists),
              they <strong>Could</strong> recover with effort (an alternate
              exists somewhere but isn&apos;t pre-staged), or they{" "}
              <strong>Cannot</strong> recover at all. Almost nobody knows the
              answer in advance.
            </p>
            <p>
              The information needed to know is usually scattered — in a
              procurement spreadsheet, an ops director&apos;s head, a contract
              clause, a vendor relationship that was personal. It&apos;s never
              consolidated. So when the test arrives, the answer arrives with
              it, and there&apos;s nothing to mitigate against in advance.
            </p>
            <p className="font-semibold text-brand-ink">
              riscManager.com™ is the workspace that makes the answer
              continuously visible — before the test.
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
              Three operating pillars.
            </h2>
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
              Practitioner-built, multi-tenant, ready to use day one.
            </h2>
          </div>

          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {howItWorks.map((h) => (
              <li
                key={h.title}
                className="rounded-xl border border-brand-paper/15 bg-brand-paper/5 p-6 backdrop-blur"
              >
                <h3 className="font-display text-lg">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-taupe">
                  {h.body}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Outputs */}
      <section className="py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            What You Walk Away With
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            Defensible outputs, not just a database.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            riscManager isn&apos;t a passive store of facts. Every entry is
            structured to produce documents and decisions that hold up under
            review.
          </p>

          <ul className="mt-8 space-y-3">
            {outputs.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-brand-ink-mid"
              >
                <span aria-hidden className="mt-1 text-brand-orange">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Pricing / availability — the "how it powers our consulting" anchor target */}
      <section
        id="how-it-powers"
        className="scroll-mt-20 bg-brand-taupe-light/60 py-20 sm:py-24"
      >
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            Availability
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            How to get a workspace.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-orange bg-brand-paper p-7 ring-1 ring-brand-orange">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Included
              </p>
              <h3 className="mt-2 font-display text-xl text-brand-maroon">
                Program &amp; Enterprise engagements
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                If you&apos;re engaging us for a{" "}
                <Link
                  href="/packages"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Program
                </Link>{" "}
                or{" "}
                <Link
                  href="/packages"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Enterprise
                </Link>{" "}
                tier engagement, riscManager.com™ is bundled — your workspace
                gets provisioned during onboarding and our practitioners work
                inside it alongside your team.
              </p>
            </div>
            <div className="rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Standalone
              </p>
              <h3 className="mt-2 font-display text-xl text-brand-maroon">
                Licensing on request
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                Want the workspace without a full consulting engagement?
                Standalone licensing is available on request. Pricing depends on
                workspace count and seat count; we&apos;ll quote on the call.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Waitlist form */}
      <section
        id="request-access"
        className="scroll-mt-20 bg-brand-maroon py-20 text-brand-paper sm:py-24"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Request early access
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">
                Join the list.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-brand-taupe">
                riscManager.com™ is currently in active development with a
                small group of consulting clients. We&apos;re opening
                additional workspaces in waves as the build hardens.
              </p>
              <p className="mt-4 text-sm text-brand-taupe">
                Drop your details below and we&apos;ll reach out personally
                when there&apos;s a slot. If you&apos;d rather just talk supply
                chain right now, book a working call from the confirmation
                email.
              </p>
            </div>

            <div className="rounded-2xl border border-brand-paper/15 bg-brand-paper p-7 text-brand-ink">
              <RiscManagerWaitlistForm />
            </div>
          </div>
        </Container>
      </section>

      {/* Cross-link footer */}
      <section className="py-16">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-2xl text-brand-maroon sm:text-3xl">
            Looking for the consulting service?
          </h2>
          <p className="mt-3 text-sm text-brand-ink-mid">
            riscManager.com™ is the operating layer.{" "}
            <Link
              href="/services/supply-chain-risk"
              className="font-semibold text-brand-orange hover:underline"
            >
              Supply Chain Risk
            </Link>{" "}
            is the consulting service that uses it.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <CtaButton href="/services/supply-chain-risk" variant="ghost">
              Supply Chain Risk Service
            </CtaButton>
            <CtaButton href={SITE.calendly} external>
              Book a consultation
            </CtaButton>
          </div>
        </Container>
      </section>
    </>
  );
}
