import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal-layout";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How e|Resilient LLC collects, uses, and protects information from visitors to eresilient.com.",
  alternates: { canonical: `${SITE.url}/legal/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate="May 2, 2026">
      <p>
        {SITE.legalName} (&ldquo;e|Resilient,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy. This
        Privacy Policy describes how we collect, use, and protect information
        when you visit{" "}
        <Link href="/">{SITE.url.replace(/^https?:\/\//, "")}</Link> (the
        &ldquo;Site&rdquo;) or interact with us directly. It applies to
        information collected through the Site and via the channels described
        below.
      </p>

      <h2>Information We Collect</h2>

      <p>
        <strong>Information you provide directly.</strong> When you submit a
        form on the Site — for example, the BCP Readiness Scorecard request
        form or any contact request — we collect the information you provide:
        typically your name, email address, organization name, and (optionally)
        your role. When you book a consultation through our Calendly link, the
        information you provide to Calendly is also retained by Calendly under
        their privacy policy.
      </p>

      <p>
        <strong>Information collected automatically.</strong> When you visit
        the Site, our hosting provider (Vercel) automatically logs standard
        request data including your IP address, browser type, referring page,
        and pages viewed. We may use Vercel Analytics and Google Analytics 4
        to understand aggregate traffic patterns. These services may set
        cookies or use similar technologies as described under
        &ldquo;Cookies&rdquo; below.
      </p>

      <p>
        <strong>Information from third parties.</strong> We do not purchase or
        receive personal information about Site visitors from third-party data
        brokers.
      </p>

      <h2>How We Use Information</h2>

      <p>We use the information we collect to:</p>

      <ul>
        <li>Deliver requested resources, including the BCP Readiness Scorecard and any other materials you request</li>
        <li>Respond to inquiries and support our consultative engagement process</li>
        <li>Send occasional, practitioner-grade BCM updates from Karl D. Bryant — you can unsubscribe at any time using the link in any email</li>
        <li>Maintain, secure, and improve the Site and our services</li>
        <li>Comply with legal obligations and enforce our terms</li>
      </ul>

      <p>
        We do not sell personal information. We do not share your information
        with third parties for their independent marketing purposes.
      </p>

      <h2>Service Providers We Use</h2>

      <p>
        We use a small set of third-party service providers to operate the
        Site and our communications. Each acts as a data processor on our
        behalf:
      </p>

      <ul>
        <li><strong>Vercel</strong> — hosting, content delivery, analytics</li>
        <li><strong>Vercel Postgres</strong> — secure storage for subscriber records</li>
        <li><strong>Resend</strong> — transactional email and the occasional newsletter</li>
        <li><strong>Calendly</strong> — consultation booking, when you choose to use it</li>
        <li><strong>Google Analytics 4</strong> — aggregate traffic measurement (only when enabled and consent permits in your jurisdiction)</li>
      </ul>

      <p>
        Each of these providers operates under their own privacy and security
        terms. We have configured them to retain only the information needed
        for the purposes described in this policy.
      </p>

      <h2>Cookies and Similar Technologies</h2>

      <p>
        The Site uses a minimal set of cookies. Functional cookies may be set
        by Vercel Analytics or, if enabled, Google Analytics 4 — these are
        used to measure how visitors interact with the Site so we can improve
        it. We do not use advertising cookies, behavioral retargeting, or
        cross-site tracking.
      </p>

      <p>
        Most browsers let you refuse cookies or alert you when cookies are
        being sent. Refer to your browser&apos;s help documentation to manage
        cookie preferences.
      </p>

      <h2>Your Rights</h2>

      <p>
        Depending on your jurisdiction, you may have rights to access,
        correct, delete, or restrict the use of personal information we hold
        about you, including:
      </p>

      <ul>
        <li><strong>Access</strong> — request a copy of the information we hold about you</li>
        <li><strong>Correction</strong> — request that we correct inaccurate information</li>
        <li><strong>Deletion</strong> — request that we delete information we hold about you, subject to legal retention requirements</li>
        <li><strong>Opt-out</strong> — unsubscribe from communications via the link in any email, or by contacting us</li>
      </ul>

      <p>
        To exercise any of these rights, email us at{" "}
        <a href={SITE.contact.emailHref}>{SITE.contact.email}</a>. We aim to
        respond within 30 days. We will not discriminate against you for
        exercising any of these rights.
      </p>

      <p>
        Residents of California, Colorado, Connecticut, Utah, Virginia, and
        other U.S. states with comprehensive consumer privacy laws have
        additional rights under those laws. Residents of the European
        Economic Area, United Kingdom, and similar jurisdictions have rights
        under the GDPR and equivalent regulations. Where applicable, you
        also have the right to lodge a complaint with your local data
        protection authority.
      </p>

      <h2>Data Retention</h2>

      <p>
        We retain subscriber and contact information for as long as you
        remain subscribed or until you request deletion, whichever comes
        first. Server logs are retained per Vercel&apos;s standard policy,
        typically 30 days. Aggregated, anonymized analytics may be retained
        indefinitely.
      </p>

      <h2>Security</h2>

      <p>
        We use reasonable technical and organizational measures to protect
        information we collect — including encrypted transit (HTTPS),
        encrypted storage at our hosting and database providers, access
        controls, and minimal-scope data collection. No system is perfectly
        secure; we cannot guarantee absolute security but we work to maintain
        practices commensurate with the sensitivity of the information we
        hold.
      </p>

      <h2>Children&apos;s Privacy</h2>

      <p>
        The Site is not intended for children under 16, and we do not
        knowingly collect personal information from children under 16. If you
        believe a child has provided information to us, contact us and we
        will delete it.
      </p>

      <h2>Changes to This Policy</h2>

      <p>
        We may update this Privacy Policy from time to time. The
        &ldquo;Effective&rdquo; date at the top of the page reflects the most
        recent version. Material changes will be communicated to active
        subscribers by email.
      </p>

      <h2>Contact Us</h2>

      <p>
        Questions about this Privacy Policy or our data practices?
      </p>

      <ul>
        <li>Email: <a href={SITE.contact.emailHref}>{SITE.contact.email}</a></li>
        <li>Phone: <a href={SITE.contact.phoneHref}>{SITE.contact.phone}</a></li>
        <li>
          Mail: {SITE.legalName}, {SITE.contact.address.street},{" "}
          {SITE.contact.address.city}, {SITE.contact.address.region}{" "}
          {SITE.contact.address.postal}
        </li>
      </ul>
    </LegalLayout>
  );
}
