/**
 * Stripe helpers for client invoicing.
 *
 * Graceful no-op pattern (matches email.ts / db.ts): when STRIPE_SECRET_KEY
 * is unset, hasStripe() is false and invoice creation records a local draft
 * only, so dev/preview works end-to-end without a Stripe account.
 *
 * Payment model: send-invoice collection (not checkout). Stripe hosts the
 * invoice page where the client pays by ACH debit or card — right shape for
 * $5k+ consulting engagements (ACH is 0.8% capped at $5 vs ~2.9% card).
 */
import Stripe from "stripe";
import type { ClientRecord } from "./portal-db";
import { setClientStripeCustomer } from "./portal-db";

let cached: Stripe | null = null;

export function hasStripe(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!cached) cached = new Stripe(process.env.STRIPE_SECRET_KEY);
  return cached;
}

/**
 * Find-or-create the Stripe customer for a client and persist the id.
 */
export async function ensureStripeCustomer(
  client: ClientRecord,
): Promise<{ ok: boolean; customerId?: string; error?: string }> {
  const stripe = stripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  if (client.stripeCustomerId) {
    return { ok: true, customerId: client.stripeCustomerId };
  }
  try {
    const customer = await stripe.customers.create({
      name: client.name,
      email: client.primaryContactEmail ?? undefined,
      metadata: { eresilient_client_id: client.id },
    });
    await setClientStripeCustomer(client.id, customer.id);
    return { ok: true, customerId: customer.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe] ensureStripeCustomer failed", message);
    return { ok: false, error: message };
  }
}

export type CreatedStripeInvoice = {
  stripeInvoiceId: string;
  hostedInvoiceUrl: string | null;
  status: string;
  dueDate: string | null;
};

/**
 * Create, itemize, and finalize a send-invoice Stripe invoice.
 * Finalizing produces the hosted payment page URL we surface in the
 * client portal and email to the client.
 */
export async function createAndFinalizeInvoice(opts: {
  customerId: string;
  amountCents: number;
  description: string;
  daysUntilDue: number;
  clientId: string;
  engagementId?: string | null;
}): Promise<
  { ok: true; invoice: CreatedStripeInvoice } | { ok: false; error: string }
> {
  const stripe = stripeClient();
  if (!stripe) return { ok: false, error: "Stripe is not configured." };
  try {
    const draft = await stripe.invoices.create({
      customer: opts.customerId,
      collection_method: "send_invoice",
      days_until_due: opts.daysUntilDue,
      auto_advance: false,
      metadata: {
        eresilient_client_id: opts.clientId,
        eresilient_engagement_id: opts.engagementId ?? "",
      },
    });
    await stripe.invoiceItems.create({
      customer: opts.customerId,
      invoice: draft.id,
      amount: opts.amountCents,
      currency: "usd",
      description: opts.description,
    });
    const finalized = await stripe.invoices.finalizeInvoice(draft.id!);
    return {
      ok: true,
      invoice: {
        stripeInvoiceId: finalized.id!,
        hostedInvoiceUrl: finalized.hosted_invoice_url ?? null,
        status: finalized.status ?? "open",
        dueDate: finalized.due_date
          ? new Date(finalized.due_date * 1000).toISOString().slice(0, 10)
          : null,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe] createAndFinalizeInvoice failed", message);
    return { ok: false, error: message };
  }
}
