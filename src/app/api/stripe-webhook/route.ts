import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeClient } from "@/lib/stripe";
import { getClient, syncInvoiceFromStripe, type InvoiceStatus } from "@/lib/portal-db";
import { sendInvoiceEventNotice } from "@/lib/portal-email";
import { logAudit } from "@/lib/audit";

/**
 * Stripe webhook: keeps the local invoices table in sync with Stripe's
 * invoice lifecycle and notifies the firm inbox on paid / failed.
 *
 * Configure in the Stripe dashboard with endpoint {SITE.url}/api/stripe-webhook
 * and events: invoice.finalized, invoice.paid, invoice.payment_failed,
 * invoice.voided, invoice.marked_uncollectible. Signing secret goes in
 * STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const stripe = stripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.warn("[stripe-webhook] Stripe or webhook secret not configured");
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await req.text();
    event = await stripe.webhooks.constructEventAsync(payload, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] signature verification failed", message);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const statusByEvent: Record<string, InvoiceStatus> = {
    "invoice.finalized": "open",
    "invoice.paid": "paid",
    "invoice.voided": "void",
    "invoice.marked_uncollectible": "uncollectible",
  };

  switch (event.type) {
    case "invoice.finalized":
    case "invoice.paid":
    case "invoice.voided":
    case "invoice.marked_uncollectible": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.id) break;
      void logAudit({
        actorRole: "system",
        clientId: invoice.metadata?.eresilient_client_id || null,
        action: `stripe.${event.type}`,
        detail: { stripeInvoiceId: invoice.id },
      });
      await syncInvoiceFromStripe({
        stripeInvoiceId: invoice.id,
        status: statusByEvent[event.type],
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        paidAt:
          event.type === "invoice.paid"
            ? new Date(
                (invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000)) *
                  1000,
              ).toISOString()
            : null,
      });
      if (event.type === "invoice.paid") {
        const clientId = invoice.metadata?.eresilient_client_id;
        const client = clientId ? await getClient(clientId) : null;
        void sendInvoiceEventNotice({
          event: "paid",
          clientName: client?.name ?? null,
          amountCents: invoice.amount_paid ?? null,
          stripeInvoiceId: invoice.id,
        });
      }
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.id) break;
      const clientId = invoice.metadata?.eresilient_client_id;
      const client = clientId ? await getClient(clientId) : null;
      void sendInvoiceEventNotice({
        event: "payment_failed",
        clientName: client?.name ?? null,
        amountCents: invoice.amount_due ?? null,
        stripeInvoiceId: invoice.id,
      });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
