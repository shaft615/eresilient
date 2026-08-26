/**
 * Application audit trail. One row per action, admin- and client-side.
 *
 * logAudit is fire-and-forget by design: callers invoke it with `void`
 * and never await, so a slow or missing DB can't affect the user path.
 * At a few hundred bytes per indexed insert this is effectively free;
 * see migration 006 for the retention/pruning note.
 *
 * Sign-in/sign-out events are not logged here — Clerk's own dashboard
 * logs cover authentication.
 */
import { sql } from "@vercel/postgres";

export type AuditActorRole = "admin" | "client" | "system";

export type AuditEntry = {
  id: string;
  createdAt: string;
  actorEmail: string | null;
  actorRole: AuditActorRole;
  clientId: string | null;
  clientName?: string | null;
  action: string;
  detail: Record<string, unknown>;
};

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

export async function logAudit(e: {
  actorEmail?: string | null;
  actorRole: AuditActorRole;
  clientId?: string | null;
  action: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  if (!hasDb()) return;
  try {
    await sql`
      INSERT INTO audit_log (actor_email, actor_role, client_id, action, detail)
      VALUES (
        ${e.actorEmail ?? null},
        ${e.actorRole},
        ${e.clientId ?? null},
        ${e.action},
        ${JSON.stringify(e.detail ?? {})}::jsonb
      )
    `;
  } catch (err) {
    // Never let audit failures surface to the user path.
    console.error("[audit] logAudit failed", err);
  }
}

export async function listAudit(opts?: {
  clientId?: string;
  limit?: number;
}): Promise<AuditEntry[]> {
  if (!hasDb()) return [];
  const limit = Math.min(opts?.limit ?? 200, 500);
  try {
    if (opts?.clientId) {
      const { rows } = await sql<AuditEntry>`
        SELECT
          a.id,
          a.created_at  AS "createdAt",
          a.actor_email AS "actorEmail",
          a.actor_role  AS "actorRole",
          a.client_id   AS "clientId",
          c.name        AS "clientName",
          a.action,
          a.detail
        FROM audit_log a
        LEFT JOIN clients c ON c.id = a.client_id
        WHERE a.client_id = ${opts.clientId}
        ORDER BY a.created_at DESC
        LIMIT ${limit}
      `;
      return rows;
    }
    const { rows } = await sql<AuditEntry>`
      SELECT
        a.id,
        a.created_at  AS "createdAt",
        a.actor_email AS "actorEmail",
        a.actor_role  AS "actorRole",
        a.client_id   AS "clientId",
        c.name        AS "clientName",
        a.action,
        a.detail
      FROM audit_log a
      LEFT JOIN clients c ON c.id = a.client_id
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (err) {
    console.error("[audit] listAudit failed", err);
    return [];
  }
}
