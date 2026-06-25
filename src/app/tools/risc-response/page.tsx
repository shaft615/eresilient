import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { RiscWordmark, RiscText } from "@/components/risc-wordmark";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "riscResponse™ — Incident Response & Activation Platform",
  description:
    "riscResponse™ is the incident response and activation workspace in the RISC family from e|Resilient. ISO 22301:2019 §8.4 and ISO 22320 aligned. Declare an incident, activate the right response and continuity plans, coordinate the team from one source of truth, and capture every decision in a time-stamped log — so the response is managed, not improvised. In development; join the early-access waitlist.",
  alternates: { canonical: `${SITE.url}/tools/risc-response` },
};

const pillars = [
  {
    icon: "🚨",
    title: "Declare and activate",
    summary:
      "The moment something happens, riscResponse™ turns a written plan into a live response. Declare the incident, classify its severity, and the right response and continuity plans activate — no scramble to find the binder while the clock runs.",
    bullets: [
      "Incident declaration with severity classification (Sev 1–4)",
      "Activation authority captured — who can declare, who must be told",
      "One-click activation pulls the relevant response and continuity plans",
      "Auto-notification to the response team the moment the incident opens",
    ],
  },
  {
    icon: "🧭",
    title: "Coordinate the response",
    summary:
      "During an event, everyone working from a different document, group text, and phone call is how managed incidents become chaotic ones. riscResponse™ puts the whole team on one live source of truth for the duration.",
    bullets: [
      "Role-based action checklists — every seat knows its next move",
      "Live status board: open tasks, owners, and current incident state",
      "Task assignment and hand-off tracked in real time",
      "Communication log for internal, customer, and stakeholder updates",
    ],
  },
  {
    icon: "🧾",
    title: "Capture the record",
    summary:
      "The decisions made under pressure are exactly the ones an after-action review and an auditor will ask about later. riscResponse™ writes the record as the response unfolds — automatically, with timestamps — so nobody is reconstructing it from memory a week later.",
    bullets: [
      "Time-stamped decision and event log built automatically",
      "Who decided what, when, and on what information — captured inline",
      "Severity changes and escalation history tracked per incident",
      "After-action report generated from the live record, not rebuilt after",
    ],
  },
];

const howItWorks = [
  {
    title: "Pre-stage the response",
    body: "Before anything happens, map your response plans, Crisis and Incident Management Team roles, escalation triggers, and communication templates into the workspace — fed by the threats from riscScope™ and the recovery objectives from riscAnalysis™. The response is staged and waiting, not assembled mid-crisis.",
  },
  {
    title: "Declare the incident",
    body: "When a disruption hits, the on-call lead declares it, sets the severity, and the right plans activate. The response team is notified automatically and arrives in a workspace that already knows what plan is running and what each role owns.",
  },
  {
    title: "Run the response",
    body: "Role-based action checklists, a live status board, and real-time task assignment keep everyone aligned through the event. Every decision and status change is logged with a timestamp as it happens. Auto-saved at every input, multi-device, resume from anywhere.",
  },
  {
    title: "Stand down and debrief",
    body: "Close the incident, export the full timeline and decision log, and generate the after-action report with corrective actions — the input that drives your next exercise cycle and the evidence an auditor or insurer will ask to see.",
  },
];

const outputs = [
  "Time-stamped incident timeline and decision log — the defensible record of who decided what, when, and on what information",
  "Activated plan and role-assignment matrix showing who held which response role for the duration of the event",
  "After-action report (AAR) with corrective actions, ready to feed the next exercise and plan-revision cycle",
  "Severity classification and escalation history for every incident, with the declaration and stand-down times",
  "Communication log: every internal, customer, and stakeholder notification sent during the response",
  "CSV and print-ready PDF export of the full incident record for the board, the insurer, or the regulator",
  "Incident-over-incident comparison — see whether declaration, activation, and recovery times are actually improving",
];

export default function RiscResponsePage() {
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

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-3 py-1.5">
              <span aria-hidden className="text-sm">🛟</span>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-orange">
                ISO 22301:2019 §8.4 · ISO 22320
              </span>
            </div>
            <span className="inline-flex items-center rounded-full border border-brand-paper/25 bg-brand-paper/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand-taupe">
              In development
            </span>
          </div>

          <h1 className="mt-6 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            <RiscWordmark name="riscResponse™" onDark />
          </h1>

          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">
            <span className="text-brand-paper">RISC</span> ·{" "}
            <span className="text-brand-taupe">Risk Intelligent Supply Chain</span>
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-taupe">
            <RiscText onDark>riscResponse™</RiscText> is the incident response
            and activation workspace in the RISC family from e|Resilient. When
            a disruption hits,
            declare the incident, activate the right plans, coordinate the
            team from one source of truth, and capture every decision in a
            defensible timeline — so the response is managed, not improvised.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CtaButton href={SITE.calendly} external>
              Join the waitlist
            </CtaButton>
            <CtaButton href="#access" variant="ghost-on-dark">
              How to get access
            </CtaButton>
          </div>
        </Container>
      </section>

      {/* RISC family note */}
      <section className="border-b border-brand-taupe-mid/40 bg-brand-cream py-10">
        <Container width="narrow">
          <p className="text-sm leading-relaxed text-brand-ink-mid">
            <span className="font-semibold text-brand-ink">
              The RISC family.
            </span>{" "}
            The lowercase &ldquo;risc&rdquo; prefix is shared across our
            tools and originates with{" "}
            <Link
              href="/tools"
              className="font-semibold hover:underline"
            >
              <RiscText>riscManager.com™</RiscText>
            </Link>
            , our Risk Intelligent Supply Chain platform. Where{" "}
            <Link
              href="/tools/risc-scope"
              className="font-semibold hover:underline"
            >
              <RiscText>riscScope™</RiscText>
            </Link>{" "}
            assesses the threats and{" "}
            <Link
              href="/tools/risc-analysis"
              className="font-semibold hover:underline"
            >
              <RiscText>riscAnalysis™</RiscText>
            </Link>{" "}
            sets the recovery objectives, <RiscText>riscResponse™</RiscText> is
            where the program is put to work — the execution layer that
            activates the plans the rest of the family spent its effort making
            defensible.
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
            The plan is written. The incident still goes sideways.
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-brand-ink-mid">
            <p>
              A company can do everything right — a current risk register, a
              defensible BIA, a continuity plan signed off by leadership —
              and still fumble the actual event. The reason is almost never
              the plan. It&apos;s that when the disruption finally hits,
              everyone is in a different document, a different group text,
              and a different phone call, and nobody is keeping the record.
            </p>
            <p>
              The gap isn&apos;t planning — it&apos;s activation. The first
              hour is spent deciding whether this is real, finding the right
              version of the plan, working out who&apos;s supposed to be in
              the room, and reconstructing later what was decided and when.
              That hour is paid for by every system, customer, and employee
              waiting on a response that hasn&apos;t organized itself yet.
            </p>
            <p className="font-semibold text-brand-ink">
              <RiscText>riscResponse™</RiscText> closes that gap. Declare the incident, activate
              the right plans in one move, run the response from a single
              live workspace, and let the decision log write itself — so the
              after-action review reads like a managed event, not a scramble
              someone tried to remember.
            </p>
          </div>
        </Container>
      </section>

      {/* Three pillars */}
      <section className="section-warm py-20 sm:py-24">
        <Container width="wide">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              What It Does
            </p>
            <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
              The three jobs a response workspace has to do.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
              A response either activates cleanly, coordinates a team in
              real time, and leaves a defensible record — or it doesn&apos;t.
              <RiscText>riscResponse™</RiscText> is built around those three jobs and nothing it
              doesn&apos;t need during a live event.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pillars.map((p) => (
              <li
                key={p.title}
                className="surface-card flex h-full flex-col rounded-2xl border border-brand-taupe-mid p-7"
              >
                <div className="font-display text-4xl">{p.icon}</div>
                <h3 className="mt-4 font-display text-xl text-brand-maroon">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
                  <RiscText>{p.summary}</RiscText>
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
              From declaration to after-action report.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-taupe">
              Four steps. Pre-staged before the event, auto-saved through it.
              Resume from any device, any time.
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
                  <RiscText onDark>{step.body}</RiscText>
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Outputs */}
      <section className="section-blush py-20 sm:py-24">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
            What You Get
          </p>
          <h2 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
            The record an audit asks for — written as it happened.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
            Everything <RiscText>riscResponse™</RiscText> produces comes from the live response,
            not a reconstruction afterward. The timeline your board reviews,
            the AAR that drives your next exercise, and the evidence your
            insurer wants are the same source of truth — captured once, while
            it was actually happening.
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
            <span className="inline-flex items-center rounded-full border border-brand-taupe-mid bg-brand-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light">
              In development
            </span>
            <h2 className="mt-4 font-display text-3xl text-brand-maroon sm:text-4xl">
              Coming to the RISC family.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-brand-ink-mid">
              <RiscText>riscResponse™</RiscText> is in active development. Join the waitlist to
              shape it and get first access when it ships — or, if you need
              response capability today, e|Resilient delivers it hands-on
              through our Crisis Management and Emergency Response engagements.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="surface-card flex h-full flex-col rounded-2xl border border-brand-taupe-mid p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Path 1 · Early access
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-maroon">
                Be first when <RiscText>riscResponse™</RiscText> ships
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                Join the waitlist and we&apos;ll bring you into early access
                as the workspace matures. Waitlist members help shape the
                response model — the severity scale, the action checklists,
                the AAR format — and get it inside their e|Resilient
                workspace ahead of general availability.
              </p>
              <div className="mt-6">
                <CtaButton href={SITE.calendly} external>
                  Join the waitlist
                </CtaButton>
              </div>
            </div>

            <div className="surface-card flex h-full flex-col rounded-2xl border border-brand-taupe-mid p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                Path 2 · Available today
              </p>
              <h3 className="mt-2 font-display text-2xl text-brand-maroon">
                Need response capability now?
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-brand-ink-mid">
                You don&apos;t have to wait for the workspace to get the
                capability. While <RiscText>riscResponse™</RiscText> is in
                development, e|Resilient builds and runs the same response
                discipline
                with you directly through our{" "}
                <Link
                  href="/services/crisis-management"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Crisis Management
                </Link>{" "}
                and{" "}
                <Link
                  href="/services/emergency-response"
                  className="font-semibold text-brand-orange hover:underline"
                >
                  Emergency Response
                </Link>{" "}
                service lines.
              </p>
              <div className="mt-6">
                <CtaButton href="/services">See response services</CtaButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-maroon py-20 text-brand-paper sm:py-24">
        <Container width="narrow" className="text-center">
          <h2 className="font-display text-3xl sm:text-4xl">
            Stop letting the first hour decide the outcome.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-taupe">
            Join the <RiscText onDark>riscResponse™</RiscText> waitlist, or schedule a 30-minute
            consultation and we&apos;ll walk through how e|Resilient runs
            incident response today — and where the workspace is headed.
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
