import { Resend } from "resend";
import { SITE } from "./site";
import type { ContactFormInput } from "./contact-form";

let cached: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? `${SITE.legalName} <${SITE.contact.email}>`;

const SIGNATURE_HTML = `
        <hr style="border:none;border-top:1px solid #E5E0D8;margin:32px 0;">
        <p style="font-size:12px;line-height:1.6;color:#7A5C52;margin:0;">
          The ${SITE.name} Team<br>
          ${SITE.legalName}<br>
          ${SITE.contact.phone} · ${SITE.contact.email}
        </p>`;

const SIGNATURE_TEXT = `
The ${SITE.name} Team
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`;

/**
 * Send the BCP Readiness Scorecard welcome email.
 * Gracefully no-ops if RESEND_API_KEY is unset.
 */
export async function sendScorecardWelcome(opts: {
  to: string;
  name: string;
  scorecardUrl: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping welcome email", {
      to: opts.to,
    });
    return { ok: true, skipped: "no-resend" };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: "Your BCP Readiness Scorecard is ready",
      html: scorecardWelcomeHtml({ name: opts.name, url: opts.scorecardUrl }),
      text: scorecardWelcomeText({ name: opts.name, url: opts.scorecardUrl }),
    });
    if (error) {
      console.error("[email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendScorecardWelcome failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Notify the firm about a new contact form submission AND
 * send a confirmation acknowledgement to the submitter.
 * Both fire in parallel; partial failures are logged but don't block.
 */
export async function sendContactFormEmails(
  input: ContactFormInput,
): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping contact emails", {
      to: input.email,
    });
    return { ok: true, skipped: "no-resend" };
  }

  try {
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: SITE.contact.email,
        replyTo: input.email,
        subject: `[${SITE.name}] ${prettyTopic(input.topic)} — ${input.name}${
          input.organization ? ` (${input.organization})` : ""
        }`,
        html: internalNotificationHtml(input),
        text: internalNotificationText(input),
      }),
      resend.emails.send({
        from: FROM,
        to: input.email,
        replyTo: SITE.contact.email,
        subject: `Thanks — we'll be in touch (${SITE.name})`,
        html: contactConfirmationHtml(input),
        text: contactConfirmationText(input),
      }),
    ]);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendContactFormEmails failed", message);
    return { ok: false, error: message };
  }
}

function prettyTopic(t: ContactFormInput["topic"]): string {
  switch (t) {
    case "general":
      return "General inquiry";
    case "discovery":
      return "Discovery";
    case "active-incident":
      return "ACTIVE INCIDENT";
    case "rfp":
      return "RFP / RFI";
    case "partnership":
      return "Partnership";
    case "media":
      return "Press / media";
  }
}

function scorecardWelcomeHtml({ name, url }: { name: string; url: string }) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">e|Resilient</p>
        <h1 style="font-size:24px;line-height:1.2;color:#2D000F;margin:0 0 16px;">Your BCP Readiness Scorecard is ready, ${escapeHtml(firstName)}.</h1>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          Thanks for requesting the assessment. The scorecard takes about 20 minutes and walks through 42 questions across 8 ISO 22301-aligned domains. Results render instantly with a maturity band, radar view, and prioritized gap analysis.
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#FB5C01;color:#FDFCFB;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;">Take the scorecard →</a>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          When you finish, hit Print / Save PDF for a portable copy. If you want to walk through the results together — or skip ahead to scoping a continuity engagement — book a free 30-minute call:
        </p>
        <p style="margin:0 0 24px;">
          <a href="${SITE.calendly}" style="color:#FB5C01;font-weight:bold;text-decoration:underline;">${SITE.calendly}</a>
        </p>${SIGNATURE_HTML}
      </td></tr>
    </table>
  </body>
</html>`;
}

function scorecardWelcomeText({ name, url }: { name: string; url: string }) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `Your BCP Readiness Scorecard is ready, ${firstName}.

Thanks for requesting the assessment. The scorecard takes about 20 minutes and walks through 42 questions across 8 ISO 22301-aligned domains.

Take the scorecard:
${url}

When you finish, hit Print / Save PDF for a portable copy. If you want to walk through the results together — or skip ahead to scoping a continuity engagement — book a free 30-minute call:
${SITE.calendly}
${SIGNATURE_TEXT}`;
}

function internalNotificationHtml(input: ContactFormInput): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">New contact form submission</p>
        <h1 style="font-size:22px;line-height:1.2;color:#2D000F;margin:0 0 16px;">${escapeHtml(prettyTopic(input.topic))} — ${escapeHtml(input.name)}</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A2E24;margin:16px 0;">
          <tr><td style="padding:6px 0;width:120px;color:#7A5C52;">Name</td><td style="padding:6px 0;">${escapeHtml(input.name)}</td></tr>
          <tr><td style="padding:6px 0;color:#7A5C52;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(input.email)}" style="color:#FB5C01;">${escapeHtml(input.email)}</a></td></tr>
          ${input.organization ? `<tr><td style="padding:6px 0;color:#7A5C52;">Organization</td><td style="padding:6px 0;">${escapeHtml(input.organization)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#7A5C52;">Topic</td><td style="padding:6px 0;">${escapeHtml(prettyTopic(input.topic))}</td></tr>
        </table>
        <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#7A5C52;margin:16px 0 6px;">Message</p>
        <div style="background:#F0EDE8;padding:16px 18px;border-radius:8px;font-size:14px;line-height:1.6;color:#1A0A05;white-space:pre-wrap;">${escapeHtml(input.message)}</div>
        <p style="font-size:12px;color:#7A5C52;margin:24px 0 0;">Reply directly to this email to respond — replies route to ${escapeHtml(input.email)}.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function internalNotificationText(input: ContactFormInput): string {
  return `New contact form submission — ${prettyTopic(input.topic)}

Name: ${input.name}
Email: ${input.email}
${input.organization ? `Organization: ${input.organization}\n` : ""}Topic: ${prettyTopic(input.topic)}

Message:
${input.message}

Reply directly to this email to respond — replies route to ${input.email}.
`;
}

function contactConfirmationHtml(input: ContactFormInput): string {
  const firstName = input.name.split(/\s+/)[0] ?? input.name;
  const isUrgent = input.topic === "active-incident";
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">e|Resilient</p>
        <h1 style="font-size:24px;line-height:1.2;color:#2D000F;margin:0 0 16px;">Thanks, ${escapeHtml(firstName)} — we&rsquo;ve got it.</h1>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          Your message reached us at ${escapeHtml(SITE.contact.email)}. ${
            isUrgent
              ? `Because you flagged this as an <strong>active incident</strong>, we&rsquo;re routing it for fastest response. If you need to reach us immediately, call <a href="tel:+18337526365" style="color:#FB5C01;font-weight:bold;">${escapeHtml(SITE.contact.phone)}</a>.`
              : `We respond to inbound inquiries within one business day.`
          }
        </p>
        <p style="font-size:14px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          If you&rsquo;d like to skip ahead and grab a 30-minute working call:
        </p>
        <p style="margin:0 0 24px;">
          <a href="${SITE.calendly}" style="display:inline-block;background:#FB5C01;color:#FDFCFB;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;">Book a consultation →</a>
        </p>${SIGNATURE_HTML}
      </td></tr>
    </table>
  </body>
</html>`;
}

function contactConfirmationText(input: ContactFormInput): string {
  const firstName = input.name.split(/\s+/)[0] ?? input.name;
  const isUrgent = input.topic === "active-incident";
  return `Thanks, ${firstName} — we've got it.

Your message reached us at ${SITE.contact.email}. ${
    isUrgent
      ? `Because you flagged this as an ACTIVE INCIDENT, we're routing it for fastest response. If you need to reach us immediately, call ${SITE.contact.phone}.`
      : `We respond to inbound inquiries within one business day.`
  }

If you'd like to skip ahead and grab a 30-minute working call:
${SITE.calendly}
${SIGNATURE_TEXT}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
