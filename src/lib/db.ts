import { sql } from "@vercel/postgres";

export type Subscriber = {
  email: string;
  name: string;
  organization: string;
  role?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type DueSubscriber = {
  email: string;
  name: string;
};

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

/**
 * Insert (or update on conflict) a subscriber.
 * Gracefully no-ops if POSTGRES_URL is unset (dev/preview without provisioning).
 */
export async function upsertSubscriber(s: Subscriber): Promise<{
  ok: boolean;
  skipped?: "no-db";
  error?: string;
}> {
  if (!hasDb()) {
    console.warn("[db] POSTGRES_URL not set; skipping subscriber upsert", {
      email: s.email,
    });
    return { ok: true, skipped: "no-db" };
  }
  try {
    await sql`
      INSERT INTO subscribers (email, name, organization, role, source, metadata)
      VALUES (
        ${s.email},
        ${s.name},
        ${s.organization},
        ${s.role ?? null},
        ${s.source ?? "unknown"},
        ${JSON.stringify(s.metadata ?? {})}::jsonb
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        organization = EXCLUDED.organization,
        role = COALESCE(EXCLUDED.role, subscribers.role),
        source = COALESCE(EXCLUDED.source, subscribers.source),
        metadata = subscribers.metadata || EXCLUDED.metadata
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[db] upsertSubscriber failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Find subscribers due for nurture email N (2 or 3).
 * Day-3 (email 2) fires after >= 3 days since signup.
 * Day-7 (email 3) fires after >= 7 days since signup.
 * Both filter out unsubscribed and already-sent rows.
 */
export async function getDueForNurture(
  emailNumber: 2 | 3,
): Promise<DueSubscriber[]> {
  if (!hasDb()) {
    console.warn("[db] POSTGRES_URL not set; getDueForNurture returning []");
    return [];
  }
  try {
    if (emailNumber === 2) {
      const { rows } = await sql<DueSubscriber>`
        SELECT email, name
        FROM subscribers
        WHERE nurture_email_2_sent_at IS NULL
          AND unsubscribed_at IS NULL
          AND created_at <= NOW() - INTERVAL '3 days'
        ORDER BY created_at ASC
        LIMIT 200
      `;
      return rows;
    }
    const { rows } = await sql<DueSubscriber>`
      SELECT email, name
      FROM subscribers
      WHERE nurture_email_3_sent_at IS NULL
        AND unsubscribed_at IS NULL
        AND created_at <= NOW() - INTERVAL '7 days'
      ORDER BY created_at ASC
      LIMIT 200
    `;
    return rows;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[db] getDueForNurture failed", message);
    return [];
  }
}

/** Stamp the per-email send timestamp so we don't re-send. */
export async function markNurtureSent(
  email: string,
  emailNumber: 2 | 3,
): Promise<void> {
  if (!hasDb()) return;
  try {
    if (emailNumber === 2) {
      await sql`UPDATE subscribers SET nurture_email_2_sent_at = NOW() WHERE email = ${email}`;
    } else {
      await sql`UPDATE subscribers SET nurture_email_3_sent_at = NOW() WHERE email = ${email}`;
    }
  } catch (err) {
    console.error("[db] markNurtureSent failed", err);
  }
}

/** Idempotent unsubscribe. Returns true if any row was updated. */
export async function markUnsubscribed(email: string): Promise<boolean> {
  if (!hasDb()) {
    // In dev/preview without DB, treat as success so the UX isn't broken.
    console.warn("[db] POSTGRES_URL not set; markUnsubscribed treated as ok");
    return true;
  }
  try {
    const { rowCount } = await sql`
      UPDATE subscribers
      SET unsubscribed_at = COALESCE(unsubscribed_at, NOW())
      WHERE email = ${email.trim().toLowerCase()}
    `;
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[db] markUnsubscribed failed", err);
    return false;
  }
}
