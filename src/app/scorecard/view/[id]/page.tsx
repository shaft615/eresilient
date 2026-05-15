/**
 * /scorecard/view/[id]?t=<token>
 *
 * Renders a saved BCP Readiness Scorecard submission. Token-gated: the
 * `t` query param must HMAC-verify against the submission id. Karl's
 * notification email contains the only place this URL is generated.
 *
 * The renderer is intentionally simple (server-rendered table-of-
 * tables) rather than reusing the interactive scorecard component.
 * This page exists for the consultant team to review what a client
 * submitted, not for further interaction.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getScorecardSubmission } from "@/lib/scorecard-storage";
import { verifyScorecardViewToken } from "@/lib/scorecard-token";
import { Container } from "@/components/container";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Scorecard submission",
  // Internal-facing page — keep it out of search.
  robots: { index: false, follow: false },
};

// Same domain catalog the interactive scorecard uses. Duplicated here
// (as a small literal) so the viewer renders without depending on the
// "use client" component file.
const DOMAINS = [
  { id: "D1", name: "Governance & Leadership", short: "Governance", icon: "⚖️", color: "#1a3a5c", questions: ["1.1","1.2","1.3","1.4","1.5","1.6"] },
  { id: "D2", name: "Risk Assessment & Threat Analysis", short: "Risk Assessment", icon: "🎯", color: "#1e4976", questions: ["2.1","2.2","2.3","2.4","2.5"] },
  { id: "D3", name: "Business Impact Analysis", short: "BIA", icon: "📊", color: "#1a5c7a", questions: ["3.1","3.2","3.3","3.4","3.5","3.6"] },
  { id: "D4", name: "BC Strategy & Solutions", short: "BC Strategy", icon: "🗺️", color: "#0f5e5e", questions: ["4.1","4.2","4.3","4.4","4.5"] },
  { id: "D5", name: "Plans, Procedures & Documentation", short: "Plans & Docs", icon: "📋", color: "#1a4a2e", questions: ["5.1","5.2","5.3","5.4","5.5","5.6"] },
  { id: "D6", name: "Training, Awareness & Competence", short: "Training", icon: "🎓", color: "#4a2e6b", questions: ["6.1","6.2","6.3","6.4"] },
  { id: "D7", name: "Exercising & Testing", short: "Exercising", icon: "🧪", color: "#6b3a1a", questions: ["7.1","7.2","7.3","7.4","7.5"] },
  { id: "D8", name: "Performance Evaluation & Improvement", short: "Improvement", icon: "📈", color: "#5c1a1a", questions: ["8.1","8.2","8.3","8.4","8.5"] },
];

const SCORE_LABELS = ["Not Present", "Ad Hoc", "Developing", "Defined", "Optimized"];
const SCORE_COLORS = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#16a34a"];

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function ScorecardViewPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { t: token } = await searchParams;

  // Token check first — fail closed before we hit the DB.
  if (!token || !verifyScorecardViewToken(id, token)) {
    return (
      <Container width="narrow" className="py-20">
        <h1 className="font-display text-3xl text-brand-maroon">
          Invalid or missing view token
        </h1>
        <p className="mt-4 text-base text-brand-ink-mid">
          This link is signed and could not be verified. Open the most
          recent scorecard notification email and use the link there.
        </p>
      </Container>
    );
  }

  const submission = await getScorecardSubmission(id);
  if (!submission) {
    notFound();
  }

  const pct = submission.totalMax > 0
    ? Math.round((submission.totalScore / submission.totalMax) * 100)
    : 0;

  const createdAtPretty = new Date(submission.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Container width="wide" className="py-12">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          Scorecard submission · Internal view
        </p>
        <h1 className="mt-2 font-display text-3xl text-brand-maroon sm:text-4xl">
          {submission.orgName}
        </h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Stat label="Score" value={`${submission.totalScore} / ${submission.totalMax}`} />
          <Stat label="Percent" value={`${pct}%`} />
          <Stat label="Maturity" value={submission.maturityBand || "—"} />
          <Stat label="Submitted" value={createdAtPretty} />
        </div>
        {(submission.assessorName || submission.assessDate) && (
          <p className="mt-4 text-sm text-brand-ink-mid">
            {submission.assessorName ? `Assessor: ${submission.assessorName}` : ""}
            {submission.assessorName && submission.assessDate ? " · " : ""}
            {submission.assessDate ? `Assessment date: ${submission.assessDate}` : ""}
          </p>
        )}
      </div>

      {/* Domain summary */}
      <div className="mb-8 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
        <h2 className="font-display text-xl text-brand-maroon">Domain scores</h2>
        <ul className="mt-5 space-y-3">
          {DOMAINS.map((d) => {
            const ds = d.questions.reduce((sum, qid) => sum + (submission.scores[qid] ?? 0), 0);
            const dm = d.questions.length * 4;
            const dp = dm > 0 ? Math.round((ds / dm) * 100) : 0;
            return (
              <li key={d.id} className="flex items-center gap-4">
                <span
                  className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: d.color }}
                >
                  {d.id}
                </span>
                <span className="flex-1 text-sm font-semibold text-brand-ink">{d.icon} {d.name}</span>
                <span className="font-mono text-sm text-brand-ink-mid">{ds}/{dm}</span>
                <span className="w-12 text-right font-mono text-sm font-semibold text-brand-ink">{dp}%</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Question detail */}
      <div className="mb-8 rounded-2xl border border-brand-taupe-mid bg-brand-paper p-7">
        <h2 className="font-display text-xl text-brand-maroon">Question detail</h2>
        <div className="mt-5 space-y-6">
          {DOMAINS.map((d) => (
            <div key={d.id}>
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: d.color }}
              >
                <span>{d.icon}</span>
                <span>{d.id} — {d.name}</span>
              </div>
              <ul className="mt-2 space-y-1.5">
                {d.questions.map((qid) => {
                  const s = submission.scores[qid] ?? 0;
                  const note = submission.notes[qid];
                  return (
                    <li key={qid} className="flex items-start gap-3 rounded-md border border-brand-taupe-mid/60 bg-brand-paper px-3 py-2">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: SCORE_COLORS[s] }}
                      >
                        {s}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-brand-ink-light">{qid}</div>
                        <div className="text-xs text-brand-ink-mid">
                          {SCORE_LABELS[s]}
                          {note ? <em className="ml-2 not-italic text-brand-ink-light">— {note}</em> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-brand-ink-light">
        Internal view · {SITE.legalName}. This URL is signed; share within
        the consultant team only.
      </p>
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-ink-light">{label}</div>
      <div className="mt-1 font-mono text-base font-semibold text-brand-ink">{value}</div>
    </div>
  );
}
