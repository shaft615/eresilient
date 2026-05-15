import { Resend } from "resend";
import { SITE } from "./site";
import type { ContactFormInput } from "./contact-form";
import { makeUnsubscribeUrl } from "./unsubscribe";

let cached: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? `${SITE.legalName} <${SITE.contact.email}>`;

function signatureHtml(unsubscribeUrl?: string): string {
  return `
        <hr style="border:none;border-top:1px solid #E5E0D8;margin:32px 0;">
        <p style="font-size:12px;line-height:1.6;color:#7A5C52;margin:0;">
          The ${SITE.name} Team<br>
          ${SITE.legalName}<br>
          ${SITE.contact.phone} · <a href="mailto:${SITE.contact.email}" style="color:#7A5C52;">${SITE.contact.email}</a>
        </p>${
          unsubscribeUrl
            ? `<p style="font-size:11px;color:#A89088;margin:16px 0 0;">You&rsquo;re receiving this because you requested a resource from ${SITE.url.replace(/^https?:\/\//, "")}. <a href="${unsubscribeUrl}" style="color:#A89088;text-decoration:underline;">Unsubscribe</a> any time.</p>`
            : ""
        }`;
}

function signatureText(unsubscribeUrl?: string): string {
  const base = `
The ${SITE.name} Team
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`;
  if (!unsubscribeUrl) return base;
  return `${base}
You're receiving this because you requested a resource from ${SITE.url.replace(/^https?:\/\//, "")}.
Unsubscribe: ${unsubscribeUrl}
`;
}

/**
 * Send the BCP Readiness Scorecard welcome email (Day 0 / Email 1).
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

  const unsubUrl = makeUnsubscribeUrl(opts.to);
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: "Your BCP Readiness Scorecard is ready",
      html: scorecardWelcomeHtml({ name: opts.name, url: opts.scorecardUrl, unsubUrl }),
      text: scorecardWelcomeText({ name: opts.name, url: opts.scorecardUrl, unsubUrl }),
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
 * Day-3 nurture (Email 2). Practitioner-grade BCM insight pointing the
 * subscriber at the BIA cornerstone article — the highest-value piece
 * for someone who just took the readiness scorecard.
 */
export async function sendNurtureInsight(opts: {
  to: string;
  name: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping nurture insight", {
      to: opts.to,
    });
    return { ok: true, skipped: "no-resend" };
  }
  const unsubUrl = makeUnsubscribeUrl(opts.to);
  const url = `${SITE.url}/insights/how-to-conduct-a-business-impact-analysis`;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: "The single highest-leverage BCM exercise (and how to run it)",
      html: nurtureInsightHtml({ name: opts.name, url, unsubUrl }),
      text: nurtureInsightText({ name: opts.name, url, unsubUrl }),
    });
    if (error) {
      console.error("[email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendNurtureInsight failed", message);
    return { ok: false, error: message };
  }
}

/**
 * Day-7 nurture (Email 3). Soft, named CTA to book a working consultation.
 */
export async function sendNurtureConsultation(opts: {
  to: string;
  name: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set; skipping nurture CTA", {
      to: opts.to,
    });
    return { ok: true, skipped: "no-resend" };
  }
  const unsubUrl = makeUnsubscribeUrl(opts.to);
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      replyTo: SITE.contact.email,
      subject: "Quick question on your continuity program?",
      html: nurtureConsultationHtml({ name: opts.name, unsubUrl }),
      text: nurtureConsultationText({ name: opts.name, unsubUrl }),
    });
    if (error) {
      console.error("[email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendNurtureConsultation failed", message);
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

/**
 * Notify e|Resilient when a client submits the BCP Readiness Scorecard
 * with the opt-in box checked. Sends to SITE.contact.email with a
 * signed link that opens the saved submission for review.
 */
export async function sendScorecardSubmissionNotice(opts: {
  orgName: string;
  assessorName?: string | null;
  assessDate?: string | null;
  totalScore: number;
  totalMax: number;
  maturityBand?: string | null;
  viewUrl: string;
}): Promise<{ ok: boolean; skipped?: "no-resend"; error?: string }> {
  const resend = client();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set; skipping scorecard submission notice",
      { org: opts.orgName },
    );
    return { ok: true, skipped: "no-resend" };
  }
  const pct = opts.totalMax > 0
    ? Math.round((opts.totalScore / opts.totalMax) * 100)
    : 0;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: SITE.contact.email,
      subject: `[${SITE.name}] Scorecard submission — ${opts.orgName} (${pct}%, ${opts.maturityBand ?? "Unrated"})`,
      html: scorecardSubmissionHtml({ ...opts, pct }),
      text: scorecardSubmissionText({ ...opts, pct }),
    });
    if (error) {
      console.error("[email] resend returned error", error);
      return { ok: false, error: String(error.message ?? error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] sendScorecardSubmissionNotice failed", message);
    return { ok: false, error: message };
  }
}

function scorecardSubmissionHtml(opts: {
  orgName: string;
  assessorName?: string | null;
  assessDate?: string | null;
  totalScore: number;
  totalMax: number;
  maturityBand?: string | null;
  viewUrl: string;
  pct: number;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">New scorecard submission</p>
        <h1 style="font-size:22px;line-height:1.2;color:#2D000F;margin:0 0 16px;">${escapeHtml(opts.orgName)}</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#4A2E24;margin:0 0 24px;">
          <tr><td style="padding:6px 0;width:140px;color:#7A5C52;">Score</td><td style="padding:6px 0;"><strong>${opts.totalScore} / ${opts.totalMax}</strong> (${opts.pct}%)</td></tr>
          <tr><td style="padding:6px 0;color:#7A5C52;">Maturity band</td><td style="padding:6px 0;">${escapeHtml(opts.maturityBand ?? "Unrated")}</td></tr>
          ${opts.assessorName ? `<tr><td style="padding:6px 0;color:#7A5C52;">Assessor</td><td style="padding:6px 0;">${escapeHtml(opts.assessorName)}</td></tr>` : ""}
          ${opts.assessDate ? `<tr><td style="padding:6px 0;color:#7A5C52;">Assessment date</td><td style="padding:6px 0;">${escapeHtml(opts.assessDate)}</td></tr>` : ""}
        </table>
        <p style="margin:0 0 24px;">
          <a href="${opts.viewUrl}" style="display:inline-block;background:#FB5C01;color:#FDFCFB;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;">Open the submission →</a>
        </p>
        <p style="font-size:12px;color:#7A5C52;margin:0;">The link is signed; treat it like any internal record. Forward to the team if relevant.</p>
      </td></tr>
    </table>
  </body>
</html>`;
}

function scorecardSubmissionText(opts: {
  orgName: string;
  assessorName?: string | null;
  assessDate?: string | null;
  totalScore: number;
  totalMax: number;
  maturityBand?: string | null;
  viewUrl: string;
  pct: number;
}): string {
  return `New scorecard submission — ${opts.orgName}

Score: ${opts.totalScore} / ${opts.totalMax} (${opts.pct}%)
Maturity band: ${opts.maturityBand ?? "Unrated"}
${opts.assessorName ? `Assessor: ${opts.assessorName}\n` : ""}${opts.assessDate ? `Assessment date: ${opts.assessDate}\n` : ""}
Open the submission:
${opts.viewUrl}

The link is signed; treat it like any internal record.
`;
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

function scorecardWelcomeHtml({
  name,
  url,
  unsubUrl,
}: {
  name: string;
  url: string;
  unsubUrl: string;
}) {
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
        </p>${signatureHtml(unsubUrl)}
      </td></tr>
    </table>
  </body>
</html>`;
}

function scorecardWelcomeText({
  name,
  url,
  unsubUrl,
}: {
  name: string;
  url: string;
  unsubUrl: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `Your BCP Readiness Scorecard is ready, ${firstName}.

Thanks for requesting the assessment. The scorecard takes about 20 minutes and walks through 42 questions across 8 ISO 22301-aligned domains.

Take the scorecard:
${url}

When you finish, hit Print / Save PDF for a portable copy. If you want to walk through the results together — or skip ahead to scoping a continuity engagement — book a free 30-minute call:
${SITE.calendly}
${signatureText(unsubUrl)}`;
}

function nurtureInsightHtml({
  name,
  url,
  unsubUrl,
}: {
  name: string;
  url: string;
  unsubUrl: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">e|Resilient · Insight</p>
        <h1 style="font-size:22px;line-height:1.25;color:#2D000F;margin:0 0 16px;">${escapeHtml(firstName)}, the highest-leverage BCM exercise you can run this quarter.</h1>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          A quick follow-up to the readiness scorecard.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          If we had to recommend one BCM exercise to teams that scored below &ldquo;Established,&rdquo; it would be a properly scoped Business Impact Analysis. The BIA is the foundation underneath every continuity decision — without it, plans are guesses about what to recover first. With it, RTO, RPO, and dependency maps become defensible numbers you can show a board, an auditor, or your largest customer.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          We just published a step-by-step BIA methodology aligned to ISO/TS 22317 — what to do, where it usually goes wrong, and what good outputs actually look like. Roughly an 11-minute read:
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;background:#FB5C01;color:#FDFCFB;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;">Read the BIA guide →</a>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          If anything in there sparks a question about your specific situation, just hit reply — we read every response.
        </p>${signatureHtml(unsubUrl)}
      </td></tr>
    </table>
  </body>
</html>`;
}

function nurtureInsightText({
  name,
  url,
  unsubUrl,
}: {
  name: string;
  url: string;
  unsubUrl: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `${firstName}, the highest-leverage BCM exercise you can run this quarter.

A quick follow-up to the readiness scorecard.

If we had to recommend one BCM exercise to teams that scored below "Established," it would be a properly scoped Business Impact Analysis. The BIA is the foundation underneath every continuity decision — without it, plans are guesses about what to recover first. With it, RTO, RPO, and dependency maps become defensible numbers you can show a board, an auditor, or your largest customer.

We just published a step-by-step BIA methodology aligned to ISO/TS 22317 — what to do, where it usually goes wrong, and what good outputs actually look like. Roughly an 11-minute read:

${url}

If anything in there sparks a question about your specific situation, just hit reply — we read every response.
${signatureText(unsubUrl)}`;
}

function nurtureConsultationHtml({
  name,
  unsubUrl,
}: {
  name: string;
  unsubUrl: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#FDFCFB;font-family:Arial,Helvetica,sans-serif;color:#1A0A05;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <tr><td>
        <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#FB5C01;margin:0 0 8px;">e|Resilient</p>
        <h1 style="font-size:22px;line-height:1.25;color:#2D000F;margin:0 0 16px;">${escapeHtml(firstName)}, want to talk it through?</h1>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          You took the BCP Readiness Scorecard about a week ago. If you&rsquo;re still working through what the results mean for your specific situation — or you&rsquo;re looking at a gap that has a deadline attached to it — a 30-minute call with one of our practitioners will get you a clear next step.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          The call is free. No sales pitch. We bring 30+ years of Fortune 100 BCM practice to the conversation and tell you honestly whether you need our help, internal lift, or just one specific intervention.
        </p>
        <p style="margin:24px 0;">
          <a href="${SITE.calendly}" style="display:inline-block;background:#FB5C01;color:#FDFCFB;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;">Book a 30-minute call →</a>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#4A2E24;margin:0 0 16px;">
          If now isn&rsquo;t the right time, no problem — we&rsquo;ll keep sending the occasional practitioner-grade piece. And if you&rsquo;d rather not, the unsubscribe link below works in one click.
        </p>${signatureHtml(unsubUrl)}
      </td></tr>
    </table>
  </body>
</html>`;
}

function nurtureConsultationText({
  name,
  unsubUrl,
}: {
  name: string;
  unsubUrl: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? name;
  return `${firstName}, want to talk it through?

You took the BCP Readiness Scorecard about a week ago. If you're still working through what the results mean for your specific situation — or you're looking at a gap that has a deadline attached to it — a 30-minute call with one of our practitioners will get you a clear next step.

The call is free. No sales pitch. We bring 30+ years of Fortune 100 BCM practice to the conversation and tell you honestly whether you need our help, internal lift, or just one specific intervention.

Book a 30-minute call:
${SITE.calendly}

If now isn't the right time, no problem — we'll keep sending the occasional practitioner-grade piece. And if you'd rather not, the unsubscribe link below works in one click.
${signatureText(unsubUrl)}`;
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
        </p>${signatureHtml()}
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
${signatureText()}`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
