"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPortalIdentity, type PortalIdentity } from "@/lib/portal-auth";
import {
  addClientUser,
  deleteDocument,
  deleteMilestone,
  getClient,
  insertClient,
  insertDocument,
  insertEngagement,
  insertInvoice,
  insertMilestone,
  linkScorecardToClient,
  removeClientUser,
  setClientRiscWorkspace,
  setClientToolAccess,
  updateClientStatus,
  updateEngagementStatus,
  updateMilestoneStatus,
  type ClientStatus,
  type EngagementStatus,
  type MilestoneStatus,
} from "@/lib/portal-db";
import { parseUsdToCents } from "@/lib/money";
import { createAndFinalizeInvoice, ensureStripeCustomer, hasStripe } from "@/lib/stripe";
import { sendInvoiceEmail, sendPortalWelcome } from "@/lib/portal-email";
import { deleteDocumentBlob, hasBlob, uploadDocumentBlob } from "@/lib/blob";
import { packageBySlug } from "@/content/packages";
import { TOOL_SLUGS } from "@/lib/portal-tools";
import { logAudit } from "@/lib/audit";
import {
  getDiscussion,
  getTicket,
  insertDiscussion,
  insertDiscussionPost,
  insertTicketPost,
  setTicketStatus,
  type TicketStatus,
} from "@/lib/collab-db";
import { sendTicketUpdateEmail } from "@/lib/portal-email";

/** Audit helper: admin actor email from the verified identity. */
function adminEmail(identity: PortalIdentity): string {
  return identity.emails[0] ?? "unknown-admin";
}

async function requireAdmin(): Promise<PortalIdentity> {
  const identity = await getPortalIdentity();
  if (!identity?.isAdmin) {
    throw new Error("Not authorized for admin actions.");
  }
  return identity;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function backToClient(clientId: string, error?: string): never {
  const suffix = error ? `?error=${encodeURIComponent(error)}` : "";
  redirect(`/admin/clients/${clientId}${suffix}`);
}

// ---------------------------------------------------------------------------

export async function createClientAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();

  const name = str(formData, "name");
  if (!name) redirect(`/admin/clients/new?error=${encodeURIComponent("Company name is required.")}`);

  const contactEmail = str(formData, "primaryContactEmail") || null;
  const result = await insertClient({
    name,
    website: str(formData, "website") || null,
    primaryContactName: str(formData, "primaryContactName") || null,
    primaryContactEmail: contactEmail,
    phone: str(formData, "phone") || null,
    notes: str(formData, "notes") || null,
  });
  if (!result.ok || !result.id) {
    redirect(
      `/admin/clients/new?error=${encodeURIComponent(result.error ?? "Database not provisioned — client was not saved.")}`,
    );
  }

  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId: result.id,
    action: "client.create",
    detail: { name },
  });

  // Optionally grant the primary contact portal access right away.
  if (formData.get("grantPortalAccess") === "on" && contactEmail) {
    await addClientUser({
      clientId: result.id,
      email: contactEmail,
      name: str(formData, "primaryContactName") || null,
    });
    void sendPortalWelcome({ to: contactEmail, name: str(formData, "primaryContactName") || null, clientName: name });
  }

  revalidatePath("/admin");
  redirect(`/admin/clients/${result.id}`);
}

export async function updateClientStatusAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const status = str(formData, "status") as ClientStatus;
  if (!clientId || !["prospect", "active", "archived"].includes(status)) return;
  await updateClientStatus(clientId, status);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "client.status",
    detail: { status },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  backToClient(clientId);
}

export async function addClientUserAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const email = str(formData, "email").toLowerCase();
  if (!clientId) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    backToClient(clientId, "Enter a valid email address for portal access.");
  }
  const client = await getClient(clientId);
  if (!client) backToClient(clientId, "Client not found.");
  const result = await addClientUser({
    clientId,
    email,
    name: str(formData, "name") || null,
  });
  if (!result.ok) backToClient(clientId, result.error ?? "Could not add portal user.");
  void sendPortalWelcome({
    to: email,
    name: str(formData, "name") || null,
    clientName: client.name,
  });
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "client_user.add",
    detail: { email },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function removeClientUserAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const id = str(formData, "id");
  if (!id || !clientId) return;
  await removeClientUser(id);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "client_user.remove",
    detail: { clientUserId: id },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function createEngagementAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  if (!clientId) return;

  const packageSlug = str(formData, "packageSlug") || null;
  const pkg = packageSlug ? packageBySlug.get(packageSlug) : undefined;
  const title = str(formData, "title") || (pkg ? `${pkg.title} engagement` : "");
  if (!title) backToClient(clientId, "Engagement title is required.");

  const priceInput = str(formData, "price");
  const priceCents = priceInput ? parseUsdToCents(priceInput) : null;
  if (priceInput && priceCents == null) {
    backToClient(clientId, "Engagement price must be a dollar amount, e.g. 5000.");
  }

  const result = await insertEngagement({
    clientId,
    title,
    packageSlug,
    priceCents,
    startDate: str(formData, "startDate") || null,
    targetEndDate: str(formData, "targetEndDate") || null,
    notes: str(formData, "notes") || null,
  });
  if (!result.ok) backToClient(clientId, result.error ?? "Could not create engagement.");
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "engagement.create",
    detail: { title, packageSlug, priceCents },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function updateEngagementStatusAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const engagementId = str(formData, "engagementId");
  const status = str(formData, "status") as EngagementStatus;
  const valid = ["proposed", "active", "on_hold", "complete", "cancelled"];
  if (!clientId || !engagementId || !valid.includes(status)) return;
  await updateEngagementStatus(engagementId, status);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "engagement.status",
    detail: { engagementId, status },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

/**
 * Create an invoice: Stripe customer → Stripe invoice (finalized, hosted
 * payment page) → local mirror row → optional email to the client.
 * Without Stripe keys, records a local draft so the flow is still testable.
 */
export async function createInvoiceAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  if (!clientId) return;

  const client = await getClient(clientId);
  if (!client) backToClient(clientId, "Client not found.");

  const description = str(formData, "description");
  if (!description) backToClient(clientId, "Invoice description is required.");

  const amountCents = parseUsdToCents(str(formData, "amount"));
  if (amountCents == null) {
    backToClient(clientId, "Invoice amount must be a dollar amount, e.g. 2500.");
  }

  const daysUntilDue = Math.max(1, parseInt(str(formData, "daysUntilDue") || "14", 10) || 14);
  const engagementId = str(formData, "engagementId") || null;
  const billingEmail = str(formData, "billingEmail") || client.primaryContactEmail || "";

  if (!hasStripe()) {
    const local = await insertInvoice({
      clientId,
      engagementId,
      description,
      amountCents,
      status: "draft",
    });
    if (!local.ok) backToClient(clientId, local.error ?? "Could not save invoice.");
    void logAudit({
      actorEmail: adminEmail(identity),
      actorRole: "admin",
      clientId,
      action: "invoice.create",
      detail: { description, amountCents, stripe: false },
    });
    backToClient(
      clientId,
      "Stripe isn't configured — invoice saved as a local draft only (no payment link).",
    );
  }

  const customer = await ensureStripeCustomer(client);
  if (!customer.ok || !customer.customerId) {
    backToClient(clientId, `Stripe customer error: ${customer.error ?? "unknown"}`);
  }

  const created = await createAndFinalizeInvoice({
    customerId: customer.customerId,
    amountCents,
    description,
    daysUntilDue,
    clientId,
    engagementId,
  });
  if (!created.ok) backToClient(clientId, `Stripe invoice error: ${created.error}`);

  const local = await insertInvoice({
    clientId,
    engagementId,
    description,
    amountCents,
    status: created.invoice.status === "open" ? "open" : "draft",
    dueDate: created.invoice.dueDate,
    stripeInvoiceId: created.invoice.stripeInvoiceId,
    hostedInvoiceUrl: created.invoice.hostedInvoiceUrl,
    issuedAt: new Date().toISOString(),
  });
  if (!local.ok) {
    backToClient(
      clientId,
      `Invoice created in Stripe (${created.invoice.stripeInvoiceId}) but the local record failed: ${local.error}`,
    );
  }

  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "invoice.create",
    detail: {
      description,
      amountCents,
      stripe: true,
      stripeInvoiceId: created.invoice.stripeInvoiceId,
    },
  });

  if (
    formData.get("emailInvoice") === "on" &&
    billingEmail &&
    created.invoice.hostedInvoiceUrl
  ) {
    void sendInvoiceEmail({
      to: billingEmail,
      clientName: client.name,
      description,
      amountCents,
      hostedInvoiceUrl: created.invoice.hostedInvoiceUrl,
      dueDate: created.invoice.dueDate,
    });
  }

  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

// ---------------------------------------------------------------------------
// Phase 2: documents & milestones

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // keep under the 25mb action body limit

export async function uploadDocumentAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  if (!clientId) return;

  if (!hasBlob()) {
    backToClient(
      clientId,
      "Blob storage isn't configured (BLOB_READ_WRITE_TOKEN unset) — see docs/portal-setup.md.",
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    backToClient(clientId, "Choose a file to upload.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    backToClient(clientId, "File is too large — the limit is 20 MB.");
  }

  const title = str(formData, "title") || file.name;
  const uploaded = await uploadDocumentBlob({
    clientId,
    filename: file.name,
    file,
  });
  if (!uploaded.ok) backToClient(clientId, `Upload failed: ${uploaded.error}`);

  const result = await insertDocument({
    clientId,
    engagementId: str(formData, "engagementId") || null,
    title,
    filename: file.name,
    contentType: file.type || null,
    sizeBytes: file.size,
    blobUrl: uploaded.url,
    uploadedBy: identity.emails[0] ?? null,
    uploadedByRole: "firm",
  });
  if (!result.ok) {
    // Don't strand an orphaned blob if the DB row failed.
    await deleteDocumentBlob(uploaded.url);
    backToClient(clientId, result.error ?? "Could not save document record.");
  }

  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "document.upload",
    detail: { title, filename: file.name, sizeBytes: file.size },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const id = str(formData, "id");
  if (!clientId || !id) return;
  const result = await deleteDocument(id);
  if (result.ok && result.blobUrl) {
    await deleteDocumentBlob(result.blobUrl);
  }
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "document.delete",
    detail: { documentId: id },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function addMilestoneAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const engagementId = str(formData, "engagementId");
  const title = str(formData, "title");
  if (!clientId || !engagementId) return;
  if (!title) backToClient(clientId, "Milestone title is required.");
  const sortOrder = parseInt(str(formData, "sortOrder") || "0", 10) || 0;
  const result = await insertMilestone({
    engagementId,
    title,
    dueDate: str(formData, "dueDate") || null,
    sortOrder,
  });
  if (!result.ok) backToClient(clientId, result.error ?? "Could not add milestone.");
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "milestone.add",
    detail: { engagementId, title },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function updateMilestoneStatusAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const id = str(formData, "id");
  const status = str(formData, "status") as MilestoneStatus;
  if (!clientId || !id || !["pending", "in_progress", "complete"].includes(status)) return;
  await updateMilestoneStatus(id, status);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "milestone.status",
    detail: { milestoneId: id, status },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function deleteMilestoneAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const id = str(formData, "id");
  if (!clientId || !id) return;
  await deleteMilestone(id);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "milestone.delete",
    detail: { milestoneId: id },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

// ---------------------------------------------------------------------------
// Phase 3: riscManager link, tool entitlements, scorecard attribution

export async function setRiscWorkspaceAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  if (!clientId) return;
  const workspace = str(formData, "workspace");
  await setClientRiscWorkspace(clientId, workspace || null);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "client.riscmanager_link",
    detail: { workspace: workspace || null },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function setToolAccessAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  if (!clientId) return;
  const requested = formData
    .getAll("tools")
    .filter((v): v is string => typeof v === "string");
  const slugs = TOOL_SLUGS.filter((s) => requested.includes(s));
  await setClientToolAccess(clientId, slugs);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "client.tool_access",
    detail: { tools: slugs },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function linkScorecardAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const submissionId = str(formData, "submissionId");
  const clientId = str(formData, "clientId");
  if (!submissionId) return;
  await linkScorecardToClient(submissionId, clientId || null);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId: clientId || null,
    action: "scorecard.link",
    detail: { submissionId },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/pipeline");
  if (clientId) revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/pipeline");
}

// ---------------------------------------------------------------------------
// Tickets & discussions (admin side)

export async function adminPostTicketAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const ticketId = str(formData, "ticketId");
  const body = str(formData, "body");
  if (!ticketId) redirect("/admin/tickets");
  if (!body) {
    redirect(`/admin/tickets/${ticketId}?error=${encodeURIComponent("Write a reply first.")}`);
  }
  const ticket = await getTicket(ticketId);
  if (!ticket) redirect("/admin/tickets");

  const result = await insertTicketPost({
    ticketId,
    authorEmail: adminEmail(identity),
    authorName: identity.firstName,
    authorRole: "firm",
    body,
  });
  if (!result.ok) {
    redirect(`/admin/tickets/${ticketId}?error=${encodeURIComponent(result.error ?? "Could not post.")}`);
  }
  if (ticket.status === "open") {
    await setTicketStatus(ticketId, "in_progress");
  }

  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId: ticket.clientId,
    action: "ticket.reply",
    detail: { ticketId, subject: ticket.subject },
  });
  void sendTicketUpdateEmail({
    to: ticket.createdBy,
    clientName: ticket.clientName ?? "",
    subject: ticket.subject,
    update: body,
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  redirect(`/admin/tickets/${ticketId}`);
}

export async function adminSetTicketStatusAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const ticketId = str(formData, "ticketId");
  const status = str(formData, "status") as TicketStatus;
  const valid = ["open", "in_progress", "waiting_on_client", "closed"];
  if (!ticketId || !valid.includes(status)) redirect("/admin/tickets");
  const ticket = await getTicket(ticketId);
  if (!ticket) redirect("/admin/tickets");

  await setTicketStatus(ticketId, status);
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId: ticket.clientId,
    action: "ticket.status",
    detail: { ticketId, status },
  });
  if (status === "waiting_on_client" || status === "closed") {
    void sendTicketUpdateEmail({
      to: ticket.createdBy,
      clientName: ticket.clientName ?? "",
      subject: ticket.subject,
      update:
        status === "closed"
          ? "This ticket has been resolved and closed. Reply in the portal to reopen it."
          : "We need something from your side to keep this moving — check the ticket thread in your portal.",
    });
  }
  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
  redirect(`/admin/tickets/${ticketId}`);
}

export async function adminCreateDiscussionAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const clientId = str(formData, "clientId");
  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!clientId) return;
  if (!title || !body) backToClient(clientId, "A topic title and first message are both required.");

  const result = await insertDiscussion({
    clientId,
    title,
    createdBy: adminEmail(identity),
    createdRole: "firm",
    firstPost: { body, authorName: identity.firstName },
  });
  if (!result.ok || !result.id) {
    backToClient(clientId, result.error ?? "Could not start the discussion.");
  }
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId,
    action: "discussion.create",
    detail: { title, discussionId: result.id },
  });
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/discussions/${result.id}`);
}

export async function adminPostDiscussionAction(formData: FormData): Promise<void> {
  const identity = await requireAdmin();
  const discussionId = str(formData, "discussionId");
  const body = str(formData, "body");
  if (!discussionId) redirect("/admin");
  if (!body) {
    redirect(`/admin/discussions/${discussionId}?error=${encodeURIComponent("Write a message first.")}`);
  }
  const discussion = await getDiscussion(discussionId);
  if (!discussion) redirect("/admin");

  const result = await insertDiscussionPost({
    discussionId,
    authorEmail: adminEmail(identity),
    authorName: identity.firstName,
    authorRole: "firm",
    body,
  });
  if (!result.ok) {
    redirect(`/admin/discussions/${discussionId}?error=${encodeURIComponent(result.error ?? "Could not post.")}`);
  }
  void logAudit({
    actorEmail: adminEmail(identity),
    actorRole: "admin",
    clientId: discussion.clientId,
    action: "discussion.post",
    detail: { discussionId, title: discussion.title },
  });
  revalidatePath(`/admin/discussions/${discussionId}`);
  redirect(`/admin/discussions/${discussionId}`);
}
