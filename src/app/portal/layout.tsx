import type { Metadata } from "next";
import type { ReactNode } from "react";
import { UserProfile } from "@clerk/nextjs";
import { Container } from "@/components/container";
import { PasswordGateWatch } from "@/components/password-gate-watch";
import { PortalSetupNotice } from "@/components/portal-setup-notice";
import { hasClerk } from "@/lib/portal-auth";
import { needsPasswordSetup } from "@/lib/portal-access";

export const metadata: Metadata = {
  title: "Client portal",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!hasClerk()) return <PortalSetupNotice area="Client portal" />;

  // Sign-in discipline: the first sign-in happens with an emailed code;
  // before using the portal the user must set a password (a connected
  // SSO account also satisfies this). Code sign-in stays available as an
  // alternative afterward.
  if (await needsPasswordSetup()) {
    return (
      <section className="section-warm py-16 sm:py-20">
        <Container width="wide">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              One-time setup
            </p>
            <h1 className="mt-2 font-display text-3xl text-brand-ink">
              Set a password to continue
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-brand-ink-mid">
              You signed in with an emailed code. Before using the portal,
              add a password under <strong>Security → Password</strong> below.
              You&rsquo;ll still be able to sign in with an emailed code any
              time — the password is a second front door, not a replacement.
              This page unlocks automatically once a password is set.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            <UserProfile routing="hash" />
          </div>
          <PasswordGateWatch />
        </Container>
      </section>
    );
  }

  return <>{children}</>;
}
