/**
 * Client-management DB helpers: clients, client_users, engagements, invoices.
 *
 * Mirrors the pattern in db.ts / scorecard-storage.ts: graceful no-op when
 * POSTGRES_URL is unset so dev/preview without a provisioned DB still
 * renders (lists come back empty, writes are skipped).
 */
import { sql } from "@vercel/postgres";

export type ClientStatus = "prospect" | "active" | "archived";
export type EngagementStatus =
  | "proposed"
  | "active"
  | "on_hold"
  | "complete"
  | "cancelled";
export type InvoiceStatus = "draft" | "open" | "paid" | "void" | "uncollectible";

export type ClientRecord = {
  id: string;
  createdAt: string;
  name: string;
  website: string | null;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  phone: string | null;
  notes: string | null;
  status: ClientStatus;
  stripeCustomerId: string | null;
  riscmanagerWorkspace: string | null;
};

export type ClientUser = {
  id: string;
  clientId: string;
  email: string;
  name: string | null;
};

export type Engagement = {
  id: string;
  clientId: string;
  createdAt: string;
  title: string;
  packageSlug: string | null;
  status: EngagementStatus;
  priceCents: number | null;
  startDate: string | null;
  targetEndDate: string | null;
  notes: string | null;
};

export type Invoice = {
  id: string;
  clientId: string;
  engagementId: string | null;
  createdAt: string;
  description: string;
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  dueDate: string | null;
  stripeInvoiceId: string | null;
  hostedInvoiceUrl: string | null;
  issuedAt: string | null;
  paidAt: string | null;
};

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

const CLIENT_COLUMNS = `
  id,
  created_at            AS "createdAt",
  name,
  website,
  primary_contact_name  AS "primaryContactName",
  primary_contact_email AS "primaryContactEmail",
  phone,
  notes,
  status,
  stripe_customer_id    AS "stripeCustomerId",
  riscmanager_workspace AS "riscmanagerWorkspace"
`;

// ---------------------------------------------------------------------------
// Clients

export async function listClients(): Promise<ClientRecord[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql.query<ClientRecord>(
      `SELECT ${CLIENT_COLUMNS} FROM clients ORDER BY created_at DESC`,
    );
    return rows;
  } catch (err) {
    console.error("[portal-db] listClients failed", err);
    return [];
  }
}

export async function getClient(id: string): Promise<ClientRecord | null> {
  if (!hasDb()) return null;
  try {
    const { rows } = await sql.query<ClientRecord>(
      `SELECT ${CLIENT_COLUMNS} FROM clients WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[portal-db] getClient failed", err);
    return null;
  }
}

export async function insertClient(c: {
  name: string;
  website?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  phone?: string | null;
  notes?: string | null;
  status?: ClientStatus;
}): Promise<{ ok: boolean; id?: string; skipped?: "no-db"; error?: string }> {
  if (!hasDb()) {
    console.warn("[portal-db] POSTGRES_URL not set; skipping client insert");
    return { ok: true, skipped: "no-db" };
  }
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO clients (
        name, website, primary_contact_name, primary_contact_email,
        phone, notes, status
      ) VALUES (
        ${c.name},
        ${c.website ?? null},
        ${c.primaryContactName ?? null},
        ${c.primaryContactEmail ?? null},
        ${c.phone ?? null},
        ${c.notes ?? null},
        ${c.status ?? "prospect"}
      )
      RETURNING id
    `;
    return { ok: true, id: rows[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] insertClient failed", message);
    return { ok: false, error: message };
  }
}

export async function updateClientStatus(
  id: string,
  status: ClientStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      UPDATE clients SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] updateClientStatus failed", message);
    return { ok: false, error: message };
  }
}

export async function setClientStripeCustomer(
  id: string,
  stripeCustomerId: string,
): Promise<void> {
  if (!hasDb()) return;
  try {
    await sql`
      UPDATE clients
      SET stripe_customer_id = ${stripeCustomerId}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } catch (err) {
    console.error("[portal-db] setClientStripeCustomer failed", err);
  }
}

// ---------------------------------------------------------------------------
// Client users (portal access by email)

export async function listClientUsers(clientId: string): Promise<ClientUser[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<ClientUser>`
      SELECT id, client_id AS "clientId", email, name
      FROM client_users
      WHERE client_id = ${clientId}
      ORDER BY created_at ASC
    `;
    return rows;
  } catch (err) {
    console.error("[portal-db] listClientUsers failed", err);
    return [];
  }
}

export async function addClientUser(u: {
  clientId: string;
  email: string;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      INSERT INTO client_users (client_id, email, name)
      VALUES (${u.clientId}, ${u.email.toLowerCase()}, ${u.name ?? null})
      ON CONFLICT (client_id, email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, client_users.name)
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] addClientUser failed", message);
    return { ok: false, error: message };
  }
}

export async function removeClientUser(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`DELETE FROM client_users WHERE id = ${id}`;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] removeClientUser failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Resolve which client (if any) a set of verified emails may see.
 * Used by /portal after Clerk sign-in.
 */
export async function findClientForEmails(
  emails: string[],
): Promise<ClientRecord | null> {
  if (!hasDb() || emails.length === 0) return null;
  try {
    const lowered = emails.map((e) => e.toLowerCase());
    const { rows } = await sql.query<ClientRecord>(
      `SELECT ${CLIENT_COLUMNS}
       FROM clients
       WHERE id = (
         SELECT client_id FROM client_users
         WHERE LOWER(email) = ANY($1::text[])
         ORDER BY created_at ASC
         LIMIT 1
       )`,
      [lowered],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[portal-db] findClientForEmails failed", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Engagements

export async function listEngagements(clientId: string): Promise<Engagement[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<Engagement>`
      SELECT
        id,
        client_id       AS "clientId",
        created_at      AS "createdAt",
        title,
        package_slug    AS "packageSlug",
        status,
        price_cents     AS "priceCents",
        start_date      AS "startDate",
        target_end_date AS "targetEndDate",
        notes
      FROM engagements
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;
    return rows;
  } catch (err) {
    console.error("[portal-db] listEngagements failed", err);
    return [];
  }
}

export async function insertEngagement(e: {
  clientId: string;
  title: string;
  packageSlug?: string | null;
  status?: EngagementStatus;
  priceCents?: number | null;
  startDate?: string | null;
  targetEndDate?: string | null;
  notes?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!hasDb()) {
    console.warn("[portal-db] POSTGRES_URL not set; skipping engagement insert");
    return { ok: true };
  }
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO engagements (
        client_id, title, package_slug, status, price_cents,
        start_date, target_end_date, notes
      ) VALUES (
        ${e.clientId},
        ${e.title},
        ${e.packageSlug ?? null},
        ${e.status ?? "proposed"},
        ${e.priceCents ?? null},
        ${e.startDate ?? null},
        ${e.targetEndDate ?? null},
        ${e.notes ?? null}
      )
      RETURNING id
    `;
    return { ok: true, id: rows[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] insertEngagement failed", message);
    return { ok: false, error: message };
  }
}

export async function updateEngagementStatus(
  id: string,
  status: EngagementStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      UPDATE engagements SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] updateEngagementStatus failed", message);
    return { ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Invoices

const INVOICE_COLUMNS = `
  id,
  client_id          AS "clientId",
  engagement_id      AS "engagementId",
  created_at         AS "createdAt",
  description,
  amount_cents       AS "amountCents",
  currency,
  status,
  due_date           AS "dueDate",
  stripe_invoice_id  AS "stripeInvoiceId",
  hosted_invoice_url AS "hostedInvoiceUrl",
  issued_at          AS "issuedAt",
  paid_at            AS "paidAt"
`;

export async function listInvoices(clientId: string): Promise<Invoice[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql.query<Invoice>(
      `SELECT ${INVOICE_COLUMNS} FROM invoices
       WHERE client_id = $1 ORDER BY created_at DESC`,
      [clientId],
    );
    return rows;
  } catch (err) {
    console.error("[portal-db] listInvoices failed", err);
    return [];
  }
}

export async function insertInvoice(i: {
  clientId: string;
  engagementId?: string | null;
  description: string;
  amountCents: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  stripeInvoiceId?: string | null;
  hostedInvoiceUrl?: string | null;
  issuedAt?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!hasDb()) {
    console.warn("[portal-db] POSTGRES_URL not set; skipping invoice insert");
    return { ok: true };
  }
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO invoices (
        client_id, engagement_id, description, amount_cents, status,
        due_date, stripe_invoice_id, hosted_invoice_url, issued_at
      ) VALUES (
        ${i.clientId},
        ${i.engagementId ?? null},
        ${i.description},
        ${i.amountCents},
        ${i.status},
        ${i.dueDate ?? null},
        ${i.stripeInvoiceId ?? null},
        ${i.hostedInvoiceUrl ?? null},
        ${i.issuedAt ?? null}
      )
      RETURNING id
    `;
    return { ok: true, id: rows[0]?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] insertInvoice failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Sync an invoice's status from a Stripe webhook event.
 * Looks the row up by stripe_invoice_id; unknown ids are ignored
 * (e.g. invoices created directly in the Stripe dashboard).
 */
export async function syncInvoiceFromStripe(u: {
  stripeInvoiceId: string;
  status: InvoiceStatus;
  hostedInvoiceUrl?: string | null;
  paidAt?: string | null;
}): Promise<{ ok: boolean; matched: boolean; error?: string }> {
  if (!hasDb()) return { ok: true, matched: false };
  try {
    const { rowCount } = await sql`
      UPDATE invoices SET
        status = ${u.status},
        hosted_invoice_url = COALESCE(${u.hostedInvoiceUrl ?? null}, hosted_invoice_url),
        paid_at = COALESCE(${u.paidAt ?? null}, paid_at)
      WHERE stripe_invoice_id = ${u.stripeInvoiceId}
    `;
    return { ok: true, matched: (rowCount ?? 0) > 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-db] syncInvoiceFromStripe failed", message);
    return { ok: false, matched: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Leads (read-only views over existing tables for the admin dashboard)

export type LeadRow = {
  email: string;
  name: string;
  organization: string;
  role: string | null;
  source: string | null;
  createdAt: string;
};

export async function listRecentLeads(limit = 25): Promise<LeadRow[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<LeadRow>`
      SELECT email, name, organization, role, source, created_at AS "createdAt"
      FROM subscribers
      WHERE unsubscribed_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (err) {
    console.error("[portal-db] listRecentLeads failed", err);
    return [];
  }
}

export type ScorecardRow = {
  id: string;
  orgName: string;
  assessorName: string | null;
  leadEmail: string | null;
  totalScore: number;
  totalMax: number;
  maturityBand: string | null;
  createdAt: string;
};

export async function listRecentScorecards(limit = 25): Promise<ScorecardRow[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<ScorecardRow>`
      SELECT
        id,
        org_name      AS "orgName",
        assessor_name AS "assessorName",
        lead_email    AS "leadEmail",
        total_score   AS "totalScore",
        total_max     AS "totalMax",
        maturity_band AS "maturityBand",
        created_at    AS "createdAt"
      FROM scorecard_submissions
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return rows;
  } catch (err) {
    console.error("[portal-db] listRecentScorecards failed", err);
    return [];
  }
}
