import { sql } from "@vercel/postgres";

export type Subscriber = {
  email: string;
  name: string;
  organization: string;
  role?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Insert (or update on conflict) a subscriber.
 * Gracefully no-ops if POSTGRES_URL is unset (dev/preview without provisioning).
 */
export async function upsertSubscriber(s: Subscriber): Promise<{
  ok: boolean;
  skipped?: "no-db";
  error?: string;
}> {
  if (!process.env.POSTGRES_URL) {
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
