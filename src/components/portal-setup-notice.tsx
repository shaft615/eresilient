import { Container } from "./container";
import { SITE } from "@/lib/site";

/**
 * Rendered on /admin, /portal, and the sign-in pages when the Clerk env
 * vars aren't provisioned yet (local dev, fresh preview). Mirrors the
 * graceful-degradation pattern of the DB/email layers.
 */
export function PortalSetupNotice({ area }: { area: string }) {
  return (
    <section className="section-warm py-24">
      <Container width="narrow">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          {area}
        </p>
        <h1 className="mt-3 font-display text-3xl text-brand-ink">
          Sign-in isn&rsquo;t configured in this environment
        </h1>
        <p className="mt-5 leading-relaxed text-brand-ink-mid">
          The {area.toLowerCase()} requires Clerk authentication, and the{" "}
          <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> /{" "}
          <code>CLERK_SECRET_KEY</code> environment variables aren&rsquo;t set
          here. See <code>docs/portal-setup.md</code> in the repository for the
          provisioning runbook, or contact{" "}
          <a className="underline" href={SITE.contact.emailHref}>
            {SITE.contact.email}
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
