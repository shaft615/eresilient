"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPortalIdentity } from "@/lib/portal-auth";
import {
  addClientUser,
  getClient,
  insertClient,
  insertEngagement,
  insertInvoice,
  removeClientUser,
  updateClientStatus,
  updateEngagementStatus,
  type ClientStatus,
  type EngagementStatus,
} from "@/lib/portal-db";
import { parseUsdToCents } from "@/lib/money";
import { createAndFinalizeInvoice, ensureStripeCustomer, hasStripe } from "@/lib/stripe";
import { sendInvoiceEmail, sendPortalWelcome } from "@/lib/portal-email";
import { packageBySlug } from "@/content/packages";

async function requireAdmin(): Promise<void> {
  const identity = await getPortalIdentity();
  if (!identity?.isAdmin) {
    throw new Error("Not authorized for admin actions.");
  }
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
  await requireAdmin();

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
  await requireAdmin();
  const clientId = str(formData, "clientId");
  const status = str(formData, "status") as ClientStatus;
  if (!clientId || !["prospect", "active", "archived"].includes(status)) return;
  await updateClientStatus(clientId, status);
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin");
  backToClient(clientId);
}

export async function addClientUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
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
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function removeClientUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const clientId = str(formData, "clientId");
  const id = str(formData, "id");
  if (!id || !clientId) return;
  await removeClientUser(id);
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function createEngagementAction(formData: FormData): Promise<void> {
  await requireAdmin();
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
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

export async function updateEngagementStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const clientId = str(formData, "clientId");
  const engagementId = str(formData, "engagementId");
  const status = str(formData, "status") as EngagementStatus;
  const valid = ["proposed", "active", "on_hold", "complete", "cancelled"];
  if (!clientId || !engagementId || !valid.includes(status)) return;
  await updateEngagementStatus(engagementId, status);
  revalidatePath(`/admin/clients/${clientId}`);
  backToClient(clientId);
}

/**
 * Create an invoice: Stripe customer → Stripe invoice (finalized, hosted
 * payment page) → local mirror row → optional email to the client.
 * Without Stripe keys, records a local draft so the flow is still testable.
 */
export async function createInvoiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
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
