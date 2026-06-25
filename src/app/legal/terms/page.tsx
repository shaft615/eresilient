import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal-layout";
import { BrandName } from "@/components/brand-name";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing use of eresilient.com. Engagement-specific terms are addressed in separate, signed engagement letters.",
  alternates: { canonical: `${SITE.url}/legal/terms` },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" effectiveDate="May 2, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and
        use of <Link href="/">{SITE.url.replace(/^https?:\/\//, "")}</Link>{" "}
        (the &ldquo;Site&rdquo;), operated by {SITE.legalName}{" "}
        (&ldquo;e|Resilient,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). By accessing or using the Site, you agree to be
        bound by these Terms.
      </p>

      <p>
        These Terms apply to your use of the Site only. Consulting engagements
        with {SITE.name} are governed by separate, signed engagement letters
        between us and the engaging client. Nothing on the Site, including
        downloadable resources or articles, constitutes a binding consulting
        engagement.
      </p>

      <h2>Acceptable Use</h2>

      <p>
        You may use the Site for lawful purposes. You agree not to:
      </p>

      <ul>
        <li>Use the Site in any way that violates applicable law or regulation</li>
        <li>Attempt to gain unauthorized access to any part of the Site, other systems, or networks connected to the Site</li>
        <li>Interfere with or disrupt the Site or servers or networks connected to the Site</li>
        <li>Use automated systems (bots, scrapers, harvesters) to access the Site except for legitimate search-engine indexing</li>
        <li>Transmit any virus, worm, or other malicious code through the Site</li>
        <li>Submit information that is false, misleading, or impersonates another person or entity</li>
      </ul>

      <h2>Intellectual Property</h2>

      <p>
        The Site and all content on it — including text, graphics, logos,
        images, the e|Resilient brand mark, downloadable resources, and the
        underlying code — are owned by {SITE.legalName} or our licensors and
        are protected by United States and international copyright, trademark,
        and other intellectual property laws.
      </p>

      <p>
        We grant you a limited, non-exclusive, non-transferable, revocable
        license to access and use the Site for your personal or internal
        business reference, subject to these Terms. You may print or download
        articles and resources for your own internal use. You may not:
      </p>

      <ul>
        <li>Republish, redistribute, or commercially exploit Site content without our prior written permission</li>
        <li>Use Site content in derivative works, training data sets, or competing offerings without permission</li>
        <li>Remove or alter any copyright, trademark, or other proprietary notices</li>
      </ul>

      <h2>No Professional Advice</h2>

      <p>
        Content on the Site — including articles in /insights, the BCP
        Readiness Scorecard, the Capability Statement, and any other
        materials — is provided for general informational purposes. It does
        not constitute legal, financial, regulatory, or business continuity
        advice tailored to your specific circumstances.
      </p>

      <p>
        Decisions about your business continuity program, regulatory
        compliance, or risk posture should be made in consultation with
        qualified professionals familiar with your specific situation. Our
        consulting services are delivered under separate, signed engagement
        letters that govern the scope, deliverables, and limitations of any
        actual engagement.
      </p>

      <h2>Third-Party Links and Services</h2>

      <p>
        The Site may link to third-party websites, services, or resources
        (including Calendly for booking, third-party standards bodies, and
        other references). We do not control these third-party properties
        and are not responsible for their content, terms, or privacy
        practices. Inclusion of a link does not imply endorsement.
      </p>

      <h2>Disclaimers</h2>

      <p>
        THE SITE AND ALL CONTENT ARE PROVIDED &ldquo;AS IS&rdquo; AND
        &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER
        EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE FULLEST EXTENT
        PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING WARRANTIES
        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        NON-INFRINGEMENT, AND ACCURACY OR COMPLETENESS OF CONTENT.
      </p>

      <p>
        We do not warrant that the Site will be uninterrupted, error-free,
        or free of viruses or other harmful components. Your use of the Site
        is at your own risk.
      </p>

      <h2>Limitation of Liability</h2>

      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL{" "}
        <BrandName legal caps />, ITS PRINCIPALS, EMPLOYEES, OR AGENTS
        BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES — INCLUDING LOSS OF PROFITS, REVENUE, DATA, OR USE
        — ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE, EVEN IF WE HAVE
        BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>

      <p>
        OUR TOTAL CUMULATIVE LIABILITY FOR ANY CLAIM ARISING OUT OF OR
        RELATED TO THESE TERMS OR THE SITE WILL NOT EXCEED ONE HUNDRED U.S.
        DOLLARS ($100). THIS LIMITATION DOES NOT APPLY TO LIABILITY THAT
        CANNOT BE LIMITED OR EXCLUDED UNDER APPLICABLE LAW.
      </p>

      <h2>Indemnification</h2>

      <p>
        You agree to defend, indemnify, and hold harmless {SITE.legalName}{" "}
        and its principals, employees, and agents from any claims,
        liabilities, damages, losses, or expenses (including reasonable
        attorney&apos;s fees) arising out of or related to your violation of
        these Terms or your misuse of the Site.
      </p>

      <h2>Governing Law and Venue</h2>

      <p>
        These Terms are governed by the laws of the State of Illinois,
        without regard to its conflict-of-laws principles. Any dispute
        arising out of or relating to these Terms or the Site will be
        resolved exclusively in the state or federal courts located in Cook
        County, Illinois, and you consent to the personal jurisdiction of
        those courts.
      </p>

      <h2>Changes to These Terms</h2>

      <p>
        We may update these Terms from time to time. The
        &ldquo;Effective&rdquo; date at the top of the page reflects the
        most recent version. Continued use of the Site after changes
        constitutes acceptance of the updated Terms.
      </p>

      <h2>Severability</h2>

      <p>
        If any provision of these Terms is found to be unenforceable, the
        remaining provisions will remain in full force and effect.
      </p>

      <h2>Contact Us</h2>

      <p>
        Questions about these Terms?
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
