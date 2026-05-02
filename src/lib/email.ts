import { Resend } from "resend";
import { SITE } from "./site";

let cached: Resend | null = null;

function client(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? `${SITE.founder.shortName} <${SITE.contact.email}>`;

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
        </p>
        <hr style="border:none;border-top:1px solid #E5E0D8;margin:32px 0;">
        <p style="font-size:12px;line-height:1.6;color:#7A5C52;margin:0;">
          ${SITE.founder.name}, ${SITE.founder.role}<br>
          ${SITE.legalName}<br>
          ${SITE.contact.phone} · ${SITE.contact.email}
        </p>
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

${SITE.founder.name}, ${SITE.founder.role}
${SITE.legalName}
${SITE.contact.phone} · ${SITE.contact.email}
`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
