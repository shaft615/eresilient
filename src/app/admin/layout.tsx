import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Container } from "@/components/container";
import { PortalSetupNotice } from "@/components/portal-setup-notice";
import { adminEmails, getPortalIdentity, hasClerk } from "@/lib/portal-auth";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!hasClerk()) return <PortalSetupNotice area="Admin portal" />;

  const identity = await getPortalIdentity();
  // The proxy redirects signed-out visitors; this is defense in depth.
  if (!identity) {
    return (
      <section className="section-warm py-24">
        <Container width="narrow">
          <h1 className="font-display text-3xl text-brand-ink">Sign in required</h1>
          <p className="mt-4 text-brand-ink-mid">
            <Link className="underline" href="/sign-in">
              Sign in
            </Link>{" "}
            to access the admin portal.
          </p>
        </Container>
      </section>
    );
  }

  if (!identity.isAdmin) {
    const configured = adminEmails().length > 0;
    return (
      <section className="section-warm py-24">
        <Container width="narrow">
          <h1 className="font-display text-3xl text-brand-ink">Not authorized</h1>
          <p className="mt-4 leading-relaxed text-brand-ink-mid">
            {configured
              ? `Your account isn't on the admin list for ${SITE.name}. If you're a client, your workspace is in the client portal.`
              : "No ADMIN_EMAILS are configured in this environment — nobody can access the admin portal until that env var is set (see docs/portal-setup.md)."}
          </p>
          <p className="mt-4">
            <Link className="underline" href="/portal">
              Go to the client portal
            </Link>
          </p>
        </Container>
      </section>
    );
  }

  return (
    <div className="section-warm min-h-full py-10 sm:py-14">
      <Container width="wide">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-brand-taupe-mid/60 pb-5">
          <div className="flex items-baseline gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
              Admin
            </p>
            <nav className="flex gap-5 text-sm font-medium text-brand-ink-mid">
              <Link className="hover:text-brand-orange" href="/admin">
                Dashboard
              </Link>
              <Link className="hover:text-brand-orange" href="/admin/pipeline">
                Pipeline
              </Link>
              <Link className="hover:text-brand-orange" href="/admin/clients/new">
                New client
              </Link>
            </nav>
          </div>
          <UserButton />
        </div>
        {children}
      </Container>
    </div>
  );
}
