import type { Metadata } from "next";
import { Container } from "@/components/container";
import { CtaButton } from "@/components/cta-button";
import { UnsubscribeForm } from "@/components/unsubscribe-form";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description:
    "Unsubscribe from e|Resilient emails. One click, no questions asked.",
  alternates: { canonical: `${SITE.url}/unsubscribe` },
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { e, t } = await searchParams;
  const email = e?.trim().toLowerCase() ?? "";
  const token = t?.trim() ?? "";
  const isValid = email && token && verifyUnsubscribeToken(email, token);

  return (
    <section className="py-20 sm:py-24">
      <Container width="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          Email Preferences
        </p>
        <h1 className="mt-3 font-display text-3xl text-brand-maroon sm:text-4xl">
          Unsubscribe
        </h1>

        {!isValid ? (
          <div className="mt-8 rounded-xl border border-brand-taupe-mid bg-brand-taupe-light/60 p-6">
            <h2 className="font-display text-xl text-brand-maroon">
              This unsubscribe link looks invalid.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
              The link may have been truncated by your email client, or this
              page may have been opened without the right parameters. To
              unsubscribe, email us directly and we&apos;ll handle it
              immediately.
            </p>
            <div className="mt-5">
              <CtaButton href={SITE.contact.emailHref} external>
                Email {SITE.contact.email}
              </CtaButton>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-brand-taupe-mid bg-brand-paper p-7">
            <p className="text-sm text-brand-ink-mid">
              You&apos;re about to unsubscribe{" "}
              <span className="font-semibold text-brand-ink">{email}</span> from{" "}
              {SITE.legalName} emails — including the BCP Readiness Scorecard
              follow-ups and any future practitioner updates.
            </p>
            <div className="mt-6">
              <UnsubscribeForm email={email} token={token} />
            </div>
            <p className="mt-6 text-xs leading-relaxed text-brand-ink-light">
              Replied to a transactional message instead? Those are sent in
              direct response to something you submitted; they aren&apos;t
              part of an ongoing campaign and aren&apos;t affected by this
              preference.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
