/**
 * scorecard_submissions DB helpers.
 *
 * Mirrors the pattern in db.ts (subscribers): graceful no-op when
 * POSTGRES_URL is unset so dev/preview without a provisioned DB still
 * works end-to-end (just doesn't persist).
 */
import { sql } from "@vercel/postgres";

export type ScoresMap = Record<string, number>;
export type NotesMap = Record<string, string>;

export type ScorecardSubmissionInput = {
  orgName: string;
  assessorName?: string | null;
  assessDate?: string | null;
  scores: ScoresMap;
  notes: NotesMap;
  totalScore: number;
  totalMax: number;
  maturityBand?: string | null;
  leadEmail?: string | null;
  userAgent?: string | null;
  sourceIp?: string | null;
};

export type ScorecardSubmission = ScorecardSubmissionInput & {
  id: string;
  createdAt: string;
};

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

/**
 * Insert a scorecard submission. Returns the new row's id, or null if
 * the DB isn't provisioned (dev/preview).
 */
export async function insertScorecardSubmission(
  s: ScorecardSubmissionInput,
): Promise<{ ok: boolean; id?: string; skipped?: "no-db"; error?: string }> {
  if (!hasDb()) {
    console.warn(
      "[scorecard] POSTGRES_URL not set; skipping submission insert",
      { org: s.orgName },
    );
    return { ok: true, skipped: "no-db" };
  }
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO scorecard_submissions (
        org_name, assessor_name, assess_date,
        scores, notes,
        total_score, total_max, maturity_band,
        lead_email, user_agent, source_ip
      ) VALUES (
        ${s.orgName},
        ${s.assessorName ?? null},
        ${s.assessDate ?? null},
        ${JSON.stringify(s.scores)}::jsonb,
        ${JSON.stringify(s.notes)}::jsonb,
        ${s.totalScore},
        ${s.totalMax},
        ${s.maturityBand ?? null},
        ${s.leadEmail ?? null},
        ${s.userAgent ?? null},
        ${s.sourceIp ?? null}
      )
      RETURNING id
    `;
    return { ok: true, id: rows[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scorecard] insertScorecardSubmission failed", message);
    return { ok: false, error: message };
  }
}

/** Fetch a single submission by id. Returns null if not found or DB not set. */
export async function getScorecardSubmission(
  id: string,
): Promise<ScorecardSubmission | null> {
  if (!hasDb()) return null;
  try {
    const { rows } = await sql`
      SELECT
        id, created_at,
        org_name, assessor_name, assess_date,
        scores, notes,
        total_score, total_max, maturity_band,
        lead_email, user_agent, source_ip
      FROM scorecard_submissions
      WHERE id = ${id}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id as string,
      createdAt: (row.created_at as Date).toISOString(),
      orgName: row.org_name as string,
      assessorName: (row.assessor_name as string | null) ?? null,
      assessDate: row.assess_date
        ? (row.assess_date as Date).toISOString().slice(0, 10)
        : null,
      scores: row.scores as ScoresMap,
      notes: (row.notes as NotesMap) ?? {},
      totalScore: row.total_score as number,
      totalMax: row.total_max as number,
      maturityBand: (row.maturity_band as string | null) ?? null,
      leadEmail: (row.lead_email as string | null) ?? null,
      userAgent: (row.user_agent as string | null) ?? null,
      sourceIp: (row.source_ip as string | null) ?? null,
    };
  } catch (err) {
    console.error("[scorecard] getScorecardSubmission failed", err);
    return null;
  }
}
