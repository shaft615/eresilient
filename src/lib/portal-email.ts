/**
 * Transactional emails for client onboarding and invoicing.
 * Same graceful no-op pattern as email.ts: without RESEND_API_KEY these
 * skip silently and the calling flow still succeeds.
 */
import { Resend } from "resend";
import { SITE } from "./site";
import { fmtUsd } from "./money";

let cached: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? `${SITE.legalName} <${SITE.contact.email}>`;

function signatureHtml(): string {
  return `
        <hr style="border:none;border-top:1px solid #E5E0D8;margin:32px 0;">
        <p style="font-size:12px;line-height:1.6;color:#7A5C52;margin:0;">
          The ${SITE.name} Team<br>
          ${SITE.legalName}<br>
          ${SITE.contact.phone} · <a href="mailto:${SITE.contact.email}" style="color:#7A5C52;">${SITE.contact.email}</a>
        </p>`;
}

/**
 * Welcome a client contact to the portal after the admin grants access.
 */
export async function sendPortalWelcome(opts: {
  to: string;
  name?: string | null;
  clientName: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[portal-email] RESEND_API_KEY not set; skipping welcome", {
      to: opts.to,
    });
    return { ok: true, skipped: "no-resend" };
  }
  const portalUrl = `${SITE.url}/portal`;
  const greeting = opts.name ? `Hi ${opts.name},` : "Hello,";
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: `Your ${SITE.name} client portal is ready`,
      html: `
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">${greeting}</p>
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">
          ${opts.clientName} now has a client portal with ${SITE.name}. Sign in
          with this email address to see engagement status, deliverables, and
          invoices in one place.
        </p>
        <p style="margin:28px 0;">
          <a href="${portalUrl}" style="background:#C4571E;color:#FDFBF7;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">Open the client portal</a>
        </p>
        <p style="font-size:13px;line-height:1.7;color:#7A5C52;">
          First visit? Choose &ldquo;Sign up&rdquo; and register with this same
          email address (${opts.to}) — access is tied to it.
        </p>${signatureHtml()}`,
      text: `${greeting}

${opts.clientName} now has a client portal with ${SITE.name}. Sign in with this email address to see engagement status, deliverables, and invoices in one place.

Open the client portal: ${portalUrl}

First visit? Choose "Sign up" and register with this same email address (${opts.to}) — access is tied to it.

The ${SITE.name} Team
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`,
    });
    if (error) {
      console.error("[portal-email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-email] sendPortalWelcome failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Send the client their invoice with the Stripe hosted payment link.
 */
export async function sendInvoiceEmail(opts: {
  to: string;
  clientName: string;
  description: string;
  amountCents: number;
  hostedInvoiceUrl: string;
  dueDate?: string | null;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[portal-email] RESEND_API_KEY not set; skipping invoice email", {
      to: opts.to,
    });
    return { ok: true, skipped: "no-resend" };
  }
  const amount = fmtUsd(opts.amountCents);
  const due = opts.dueDate ? ` Payment is due by ${opts.dueDate}.` : "";
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: `Invoice from ${SITE.name} — ${amount}`,
      html: `
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">Hello,</p>
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">
          ${SITE.legalName} has issued an invoice to ${opts.clientName} for
          <strong>${amount}</strong>: ${opts.description}.${due}
        </p>
        <p style="margin:28px 0;">
          <a href="${opts.hostedInvoiceUrl}" style="background:#C4571E;color:#FDFBF7;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">View and pay invoice</a>
        </p>
        <p style="font-size:13px;line-height:1.7;color:#7A5C52;">
          The secure payment page accepts bank transfer (ACH) and card. A copy
          of this invoice is also available any time in your client portal at
          <a href="${SITE.url}/portal" style="color:#7A5C52;">${SITE.url.replace(/^https?:\/\//, "")}/portal</a>.
        </p>${signatureHtml()}`,
      text: `Hello,

${SITE.legalName} has issued an invoice to ${opts.clientName} for ${amount}: ${opts.description}.${due}

View and pay: ${opts.hostedInvoiceUrl}

The secure payment page accepts bank transfer (ACH) and card. A copy of this invoice is also available any time in your client portal at ${SITE.url}/portal.

The ${SITE.name} Team
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`,
    });
    if (error) {
      console.error("[portal-email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-email] sendInvoiceEmail failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Notify the firm inbox about client-side portal activity: a submitted
 * document, a new/updated ticket, a discussion post.
 */
export async function sendPortalActivityNotice(opts: {
  kind: string; // e.g. "New ticket", "Document submitted", "Discussion post"
  clientName: string;
  summary: string;
  adminPath: string; // e.g. "/admin/tickets/<id>"
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) return { ok: true, skipped: "no-resend" };
  const link = `${SITE.url}${opts.adminPath}`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: SITE.contact.email,
      subject: `${opts.kind} — ${opts.clientName}`,
      text: `${opts.kind} from ${opts.clientName}:

${opts.summary}

Open in admin: ${link}
`,
    });
    if (error) {
      console.error("[portal-email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-email] sendPortalActivityNotice failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Notify a ticket's creator when the firm replies or changes status.
 */
export async function sendTicketUpdateEmail(opts: {
  to: string;
  clientName: string;
  subject: string;
  update: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) return { ok: true, skipped: "no-resend" };
  const portalUrl = `${SITE.url}/portal`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: `Update on your ticket: ${opts.subject}`,
      html: `
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">Hello,</p>
        <p style="font-size:15px;line-height:1.7;color:#3B2A24;">
          There&rsquo;s an update on the ${opts.clientName} support ticket
          &ldquo;${opts.subject}&rdquo;:
        </p>
        <blockquote style="border-left:3px solid #C4571E;margin:16px 0;padding:4px 16px;color:#3B2A24;font-size:14px;line-height:1.7;">
          ${opts.update}
        </blockquote>
        <p style="margin:28px 0;">
          <a href="${portalUrl}" style="background:#C4571E;color:#FDFBF7;padding:12px 22px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">View in your portal</a>
        </p>${signatureHtml()}`,
      text: `Hello,

There's an update on the ${opts.clientName} support ticket "${opts.subject}":

${opts.update}

View in your portal: ${portalUrl}

The ${SITE.name} Team
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`,
    });
    if (error) {
      console.error("[portal-email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-email] sendTicketUpdateEmail failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Notify the firm inbox when Stripe reports an invoice event worth knowing
 * about (paid, payment failed).
 */
export async function sendInvoiceEventNotice(opts: {
  event: "paid" | "payment_failed";
  clientName?: string | null;
  amountCents?: number | null;
  stripeInvoiceId: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) return { ok: true, skipped: "no-resend" };
  const what =
    opts.event === "paid" ? "Invoice PAID 🎉" : "Invoice payment FAILED";
  const amount = opts.amountCents != null ? ` — ${fmtUsd(opts.amountCents)}` : "";
  const who = opts.clientName ? ` from ${opts.clientName}` : "";
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: SITE.contact.email,
      subject: `${what}${amount}${who}`,
      text: `${what}${amount}${who}

Stripe invoice: ${opts.stripeInvoiceId}
Admin portal: ${SITE.url}/admin
`,
    });
    if (error) {
      console.error("[portal-email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[portal-email] sendInvoiceEventNotice failed", message);
    return { ok: false, error: message };
  }
}
