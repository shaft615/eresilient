"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/portal-access";
import type { PortalIdentity } from "@/lib/portal-auth";
import { insertDocument, type ClientRecord } from "@/lib/portal-db";
import {
  getDiscussion,
  getTicket,
  insertDiscussion,
  insertDiscussionPost,
  insertTicket,
  insertTicketPost,
  setTicketStatus,
} from "@/lib/collab-db";
import { hasBlob, uploadDocumentBlob, deleteDocumentBlob } from "@/lib/blob";
import { logAudit } from "@/lib/audit";
import { sendPortalActivityNotice } from "@/lib/portal-email";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Portal actions always act as the signed-in member's own client — the
 * admin ?as= preview is read-only and never reaches these.
 */
async function requireMember(): Promise<{
  identity: PortalIdentity;
  client: ClientRecord;
}> {
  const ctx = await getPortalContext();
  if (!ctx?.client) {
    throw new Error("No client workspace linked to this account.");
  }
  return { identity: ctx.identity, client: ctx.client };
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function backToPortal(error?: string): never {
  redirect(error ? `/portal?error=${encodeURIComponent(error)}` : "/portal");
}

export async function portalUploadDocumentAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();

  if (!hasBlob()) backToPortal("Document submission isn't available yet — email us instead.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    backToPortal("Choose a file to submit.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    backToPortal("File is too large — the limit is 20 MB.");
  }

  const uploaded = await uploadDocumentBlob({
    clientId: client.id,
    filename: file.name,
    file,
  });
  if (!uploaded.ok) backToPortal(`Upload failed: ${uploaded.error}`);

  const title = str(formData, "title") || file.name;
  const result = await insertDocument({
    clientId: client.id,
    title,
    filename: file.name,
    contentType: file.type || null,
    sizeBytes: file.size,
    blobUrl: uploaded.url,
    uploadedBy: identity.emails[0] ?? null,
    uploadedByRole: "client",
  });
  if (!result.ok) {
    await deleteDocumentBlob(uploaded.url);
    backToPortal(result.error ?? "Could not save the document record.");
  }

  void logAudit({
    actorEmail: identity.emails[0],
    actorRole: "client",
    clientId: client.id,
    action: "document.submit",
    detail: { title, filename: file.name, sizeBytes: file.size },
  });
  void sendPortalActivityNotice({
    kind: "Document submitted",
    clientName: client.name,
    summary: `${title} (${file.name})`,
    adminPath: `/admin/clients/${client.id}`,
  });

  revalidatePath("/portal");
  backToPortal();
}

export async function createDiscussionAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) backToPortal("A topic title and first message are both required.");

  const email = identity.emails[0] ?? "unknown";
  const result = await insertDiscussion({
    clientId: client.id,
    title,
    createdBy: email,
    createdRole: "client",
    firstPost: { body, authorName: identity.firstName },
  });
  if (!result.ok || !result.id) {
    backToPortal(result.error ?? "Could not start the discussion.");
  }

  void logAudit({
    actorEmail: email,
    actorRole: "client",
    clientId: client.id,
    action: "discussion.create",
    detail: { title, discussionId: result.id },
  });
  void sendPortalActivityNotice({
    kind: "New discussion",
    clientName: client.name,
    summary: `${title}: ${body.slice(0, 200)}`,
    adminPath: `/admin/discussions/${result.id}`,
  });

  revalidatePath("/portal");
  redirect(`/portal/discussions/${result.id}`);
}

export async function postDiscussionAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();
  const discussionId = str(formData, "discussionId");
  const body = str(formData, "body");
  if (!discussionId) backToPortal();
  if (!body) redirect(`/portal/discussions/${discussionId}?error=${encodeURIComponent("Write a message first.")}`);

  const discussion = await getDiscussion(discussionId);
  if (!discussion || discussion.clientId !== client.id) {
    backToPortal("That discussion doesn't belong to your workspace.");
  }

  const email = identity.emails[0] ?? "unknown";
  const result = await insertDiscussionPost({
    discussionId,
    authorEmail: email,
    authorName: identity.firstName,
    authorRole: "client",
    body,
  });
  if (!result.ok) {
    redirect(`/portal/discussions/${discussionId}?error=${encodeURIComponent(result.error ?? "Could not post.")}`);
  }

  void logAudit({
    actorEmail: email,
    actorRole: "client",
    clientId: client.id,
    action: "discussion.post",
    detail: { discussionId, title: discussion.title },
  });
  void sendPortalActivityNotice({
    kind: "Discussion post",
    clientName: client.name,
    summary: `${discussion.title}: ${body.slice(0, 200)}`,
    adminPath: `/admin/discussions/${discussionId}`,
  });

  revalidatePath(`/portal/discussions/${discussionId}`);
  redirect(`/portal/discussions/${discussionId}`);
}

export async function createTicketAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();
  const subject = str(formData, "subject");
  const body = str(formData, "body");
  if (!subject || !body) backToPortal("A subject and description are both required to open a ticket.");

  const email = identity.emails[0] ?? "unknown";
  const result = await insertTicket({
    clientId: client.id,
    subject,
    body,
    createdBy: email,
    createdName: identity.firstName,
    createdRole: "client",
  });
  if (!result.ok || !result.id) {
    backToPortal(result.error ?? "Could not open the ticket.");
  }

  void logAudit({
    actorEmail: email,
    actorRole: "client",
    clientId: client.id,
    action: "ticket.create",
    detail: { subject, ticketId: result.id },
  });
  void sendPortalActivityNotice({
    kind: "New ticket",
    clientName: client.name,
    summary: `${subject}: ${body.slice(0, 200)}`,
    adminPath: `/admin/tickets/${result.id}`,
  });

  revalidatePath("/portal");
  redirect(`/portal/tickets/${result.id}`);
}

export async function postTicketAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();
  const ticketId = str(formData, "ticketId");
  const body = str(formData, "body");
  if (!ticketId) backToPortal();
  if (!body) redirect(`/portal/tickets/${ticketId}?error=${encodeURIComponent("Write a reply first.")}`);

  const ticket = await getTicket(ticketId);
  if (!ticket || ticket.clientId !== client.id) {
    backToPortal("That ticket doesn't belong to your workspace.");
  }

  const email = identity.emails[0] ?? "unknown";
  const result = await insertTicketPost({
    ticketId,
    authorEmail: email,
    authorName: identity.firstName,
    authorRole: "client",
    body,
  });
  if (!result.ok) {
    redirect(`/portal/tickets/${ticketId}?error=${encodeURIComponent(result.error ?? "Could not post the reply.")}`);
  }
  // A client reply puts the ball back in the firm's court.
  if (ticket.status === "waiting_on_client" || ticket.status === "closed") {
    await setTicketStatus(ticketId, "open");
  }

  void logAudit({
    actorEmail: email,
    actorRole: "client",
    clientId: client.id,
    action: "ticket.post",
    detail: { ticketId, subject: ticket.subject },
  });
  void sendPortalActivityNotice({
    kind: "Ticket reply",
    clientName: client.name,
    summary: `${ticket.subject}: ${body.slice(0, 200)}`,
    adminPath: `/admin/tickets/${ticketId}`,
  });

  revalidatePath(`/portal/tickets/${ticketId}`);
  redirect(`/portal/tickets/${ticketId}`);
}

export async function closeOwnTicketAction(formData: FormData): Promise<void> {
  const { identity, client } = await requireMember();
  const ticketId = str(formData, "ticketId");
  if (!ticketId) backToPortal();
  const ticket = await getTicket(ticketId);
  if (!ticket || ticket.clientId !== client.id) backToPortal();

  await setTicketStatus(ticketId, "closed");
  void logAudit({
    actorEmail: identity.emails[0],
    actorRole: "client",
    clientId: client.id,
    action: "ticket.close",
    detail: { ticketId, subject: ticket.subject },
  });
  revalidatePath(`/portal/tickets/${ticketId}`);
  redirect(`/portal/tickets/${ticketId}`);
}
