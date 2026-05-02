import Link from "next/link";
import { Container } from "./container";
import { Wordmark } from "./wordmark";
import { NAV, SITE } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-brand-maroon text-brand-taupe">
      <Container width="wide" className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Wordmark variant="on-dark" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-taupe/80">
              {SITE.description}
            </p>
          </div>

          <FooterCol heading="Site">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol heading="Resources">
            <li>
              <Link
                href="/capabilities"
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                Capability Statement
              </Link>
            </li>
            <li>
              <Link
                href="/resources/bcp-readiness-scorecard"
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                BCP Readiness Scorecard
              </Link>
            </li>
            <li>
              <Link
                href="/legal/privacy"
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/legal/terms"
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                Terms
              </Link>
            </li>
          </FooterCol>

          <FooterCol heading="Contact">
            <li>
              <a
                href={SITE.contact.phoneHref}
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                {SITE.contact.phone}
              </a>
            </li>
            <li>
              <a
                href={SITE.contact.emailHref}
                className="text-sm text-brand-taupe/80 transition-colors hover:text-brand-orange"
              >
                {SITE.contact.email}
              </a>
            </li>
            <li className="text-sm text-brand-taupe/70">
              {SITE.contact.address.street}
              <br />
              {SITE.contact.address.city}, {SITE.contact.address.region}{" "}
              {SITE.contact.address.postal}
            </li>
          </FooterCol>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-brand-taupe/15 pt-6 text-xs text-brand-taupe/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} {SITE.legalName}. All rights reserved.</p>
          <p>SBA Recommended · ISO 22301 Aligned · CBCP Certified</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
        {heading}
      </h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}
