import { NextResponse } from "next/server";
import { z } from "zod";
import { insertScorecardSubmission } from "@/lib/scorecard-storage";
import { sendScorecardSubmissionNotice } from "@/lib/email";
import { makeScorecardViewUrl } from "@/lib/scorecard-token";

/**
 * POST /api/scorecard-submit
 *
 * Receives a completed BCP Readiness Scorecard from the client when
 * the user has the "Share results with e|Resilient" opt-in checked on
 * the intro screen. Persists the submission to Postgres and emails a
 * signed view link to the firm.
 *
 * Returns { ok: true } on success — the client doesn't need the id;
 * the firm gets the link via email.
 */

const SubmissionInput = z.object({
  orgName: z.string().min(1, "Organization name required").max(200),
  assessorName: z.string().max(200).optional().nullable(),
  assessDate: z.string().max(40).optional().nullable(),
  scores: z.record(z.string(), z.number().int().min(0).max(4)),
  notes: z.record(z.string(), z.string().max(2000)).optional().default({}),
  totalScore: z.number().int().min(0),
  totalMax: z.number().int().min(0),
  maturityBand: z.string().max(60).optional().nullable(),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = SubmissionInput.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const result = await insertScorecardSubmission({
    orgName: data.orgName.trim(),
    assessorName: data.assessorName?.trim() || null,
    assessDate: data.assessDate?.trim() || null,
    scores: data.scores,
    notes: data.notes ?? {},
    totalScore: data.totalScore,
    totalMax: data.totalMax,
    maturityBand: data.maturityBand?.trim() || null,
    userAgent: req.headers.get("user-agent"),
    sourceIp: req.headers.get("x-forwarded-for"),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Could not record submission." },
      { status: 500 },
    );
  }

  // If the DB write was a no-op (preview without POSTGRES_URL set), still
  // return ok so the UX isn't broken — the user has their results on
  // screen either way.
  if (result.skipped === "no-db" || !result.id) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  // Fire and don't block on email — the scorecard already rendered for
  // the user; this is server-to-server bookkeeping.
  void sendScorecardSubmissionNotice({
    orgName: data.orgName.trim(),
    assessorName: data.assessorName?.trim() || null,
    assessDate: data.assessDate?.trim() || null,
    totalScore: data.totalScore,
    totalMax: data.totalMax,
    maturityBand: data.maturityBand?.trim() || null,
    viewUrl: makeScorecardViewUrl(result.id),
  });

  return NextResponse.json({ ok: true, persisted: true });
}
