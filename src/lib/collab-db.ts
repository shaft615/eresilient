/**
 * Collaboration DB helpers: discussion boards and support tickets.
 * Same graceful no-op pattern as portal-db.ts.
 */
import { sql } from "@vercel/postgres";
import type { UploaderRole } from "./portal-db";

function hasDb(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

// ---------------------------------------------------------------------------
// Discussions

export type Discussion = {
  id: string;
  clientId: string;
  createdAt: string;
  title: string;
  createdBy: string;
  createdRole: UploaderRole;
  postCount: number;
  lastPostAt: string | null;
};

export type DiscussionPost = {
  id: string;
  discussionId: string;
  createdAt: string;
  authorEmail: string;
  authorName: string | null;
  authorRole: UploaderRole;
  body: string;
};

export async function listDiscussions(clientId: string): Promise<Discussion[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<Discussion>`
      SELECT
        d.id,
        d.client_id    AS "clientId",
        d.created_at   AS "createdAt",
        d.title,
        d.created_by   AS "createdBy",
        d.created_role AS "createdRole",
        COUNT(p.id)::int    AS "postCount",
        MAX(p.created_at)   AS "lastPostAt"
      FROM discussions d
      LEFT JOIN discussion_posts p ON p.discussion_id = d.id
      WHERE d.client_id = ${clientId}
      GROUP BY d.id
      ORDER BY COALESCE(MAX(p.created_at), d.created_at) DESC
    `;
    return rows;
  } catch (err) {
    console.error("[collab-db] listDiscussions failed", err);
    return [];
  }
}

export async function getDiscussion(id: string): Promise<Discussion | null> {
  if (!hasDb()) return null;
  try {
    const { rows } = await sql<Discussion>`
      SELECT
        d.id,
        d.client_id    AS "clientId",
        d.created_at   AS "createdAt",
        d.title,
        d.created_by   AS "createdBy",
        d.created_role AS "createdRole",
        COUNT(p.id)::int  AS "postCount",
        MAX(p.created_at) AS "lastPostAt"
      FROM discussions d
      LEFT JOIN discussion_posts p ON p.discussion_id = d.id
      WHERE d.id = ${id}
      GROUP BY d.id
    `;
    return rows[0] ?? null;
  } catch (err) {
    console.error("[collab-db] getDiscussion failed", err);
    return null;
  }
}

export async function insertDiscussion(d: {
  clientId: string;
  title: string;
  createdBy: string;
  createdRole: UploaderRole;
  firstPost?: { body: string; authorName?: string | null };
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO discussions (client_id, title, created_by, created_role)
      VALUES (${d.clientId}, ${d.title}, ${d.createdBy}, ${d.createdRole})
      RETURNING id
    `;
    const id = rows[0]?.id;
    if (id && d.firstPost?.body) {
      await sql`
        INSERT INTO discussion_posts (discussion_id, author_email, author_name, author_role, body)
        VALUES (${id}, ${d.createdBy}, ${d.firstPost.authorName ?? null}, ${d.createdRole}, ${d.firstPost.body})
      `;
    }
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[collab-db] insertDiscussion failed", message);
    return { ok: false, error: message };
  }
}

export async function listDiscussionPosts(
  discussionId: string,
): Promise<DiscussionPost[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<DiscussionPost>`
      SELECT
        id,
        discussion_id AS "discussionId",
        created_at    AS "createdAt",
        author_email  AS "authorEmail",
        author_name   AS "authorName",
        author_role   AS "authorRole",
        body
      FROM discussion_posts
      WHERE discussion_id = ${discussionId}
      ORDER BY created_at ASC
    `;
    return rows;
  } catch (err) {
    console.error("[collab-db] listDiscussionPosts failed", err);
    return [];
  }
}

export async function insertDiscussionPost(p: {
  discussionId: string;
  authorEmail: string;
  authorName?: string | null;
  authorRole: UploaderRole;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      INSERT INTO discussion_posts (discussion_id, author_email, author_name, author_role, body)
      VALUES (${p.discussionId}, ${p.authorEmail}, ${p.authorName ?? null}, ${p.authorRole}, ${p.body})
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[collab-db] insertDiscussionPost failed", message);
    return { ok: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Tickets

export type TicketStatus = "open" | "in_progress" | "waiting_on_client" | "closed";

export type Ticket = {
  id: string;
  clientId: string;
  clientName?: string | null;
  createdAt: string;
  updatedAt: string;
  subject: string;
  status: TicketStatus;
  createdBy: string;
  createdName: string | null;
  postCount: number;
};

export type TicketPost = {
  id: string;
  ticketId: string;
  createdAt: string;
  authorEmail: string;
  authorName: string | null;
  authorRole: UploaderRole;
  body: string;
};

const TICKET_SELECT = `
  t.id,
  t.client_id    AS "clientId",
  c.name         AS "clientName",
  t.created_at   AS "createdAt",
  t.updated_at   AS "updatedAt",
  t.subject,
  t.status,
  t.created_by   AS "createdBy",
  t.created_name AS "createdName",
  COUNT(p.id)::int AS "postCount"
`;

export async function listTickets(clientId: string): Promise<Ticket[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql.query<Ticket>(
      `SELECT ${TICKET_SELECT}
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       LEFT JOIN ticket_posts p ON p.ticket_id = t.id
       WHERE t.client_id = $1
       GROUP BY t.id, c.name
       ORDER BY t.updated_at DESC`,
      [clientId],
    );
    return rows;
  } catch (err) {
    console.error("[collab-db] listTickets failed", err);
    return [];
  }
}

export async function listAllTickets(): Promise<Ticket[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql.query<Ticket>(
      `SELECT ${TICKET_SELECT}
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       LEFT JOIN ticket_posts p ON p.ticket_id = t.id
       GROUP BY t.id, c.name
       ORDER BY (t.status = 'closed') ASC, t.updated_at DESC`,
    );
    return rows;
  } catch (err) {
    console.error("[collab-db] listAllTickets failed", err);
    return [];
  }
}

export async function getTicket(id: string): Promise<Ticket | null> {
  if (!hasDb()) return null;
  try {
    const { rows } = await sql.query<Ticket>(
      `SELECT ${TICKET_SELECT}
       FROM tickets t
       JOIN clients c ON c.id = t.client_id
       LEFT JOIN ticket_posts p ON p.ticket_id = t.id
       WHERE t.id = $1
       GROUP BY t.id, c.name`,
      [id],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[collab-db] getTicket failed", err);
    return null;
  }
}

export async function insertTicket(t: {
  clientId: string;
  subject: string;
  body: string;
  createdBy: string;
  createdName?: string | null;
  createdRole: UploaderRole;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    const { rows } = await sql<{ id: string }>`
      INSERT INTO tickets (client_id, subject, created_by, created_name)
      VALUES (${t.clientId}, ${t.subject}, ${t.createdBy}, ${t.createdName ?? null})
      RETURNING id
    `;
    const id = rows[0]?.id;
    if (id) {
      await sql`
        INSERT INTO ticket_posts (ticket_id, author_email, author_name, author_role, body)
        VALUES (${id}, ${t.createdBy}, ${t.createdName ?? null}, ${t.createdRole}, ${t.body})
      `;
    }
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[collab-db] insertTicket failed", message);
    return { ok: false, error: message };
  }
}

export async function insertTicketPost(p: {
  ticketId: string;
  authorEmail: string;
  authorName?: string | null;
  authorRole: UploaderRole;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      INSERT INTO ticket_posts (ticket_id, author_email, author_name, author_role, body)
      VALUES (${p.ticketId}, ${p.authorEmail}, ${p.authorName ?? null}, ${p.authorRole}, ${p.body})
    `;
    await sql`UPDATE tickets SET updated_at = NOW() WHERE id = ${p.ticketId}`;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[collab-db] insertTicketPost failed", message);
    return { ok: false, error: message };
  }
}

export async function listTicketPosts(ticketId: string): Promise<TicketPost[]> {
  if (!hasDb()) return [];
  try {
    const { rows } = await sql<TicketPost>`
      SELECT
        id,
        ticket_id    AS "ticketId",
        created_at   AS "createdAt",
        author_email AS "authorEmail",
        author_name  AS "authorName",
        author_role  AS "authorRole",
        body
      FROM ticket_posts
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `;
    return rows;
  } catch (err) {
    console.error("[collab-db] listTicketPosts failed", err);
    return [];
  }
}

export async function setTicketStatus(
  id: string,
  status: TicketStatus,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasDb()) return { ok: true };
  try {
    await sql`
      UPDATE tickets SET status = ${status}, updated_at = NOW() WHERE id = ${id}
    `;
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[collab-db] setTicketStatus failed", message);
    return { ok: false, error: message };
  }
}
