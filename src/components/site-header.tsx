import Link from "next/link";
import { Container } from "./container";
import { CtaButton } from "./cta-button";
import { Wordmark } from "./wordmark";
import { NAV, SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-taupe-mid/60 bg-brand-paper/85 backdrop-blur supports-[backdrop-filter]:bg-brand-paper/70">
      <Container width="wide">
        <div className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label={`${SITE.name} home`}>
            <Wordmark priority className="h-14 w-auto" />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base font-medium text-brand-ink-mid transition-colors hover:text-brand-orange"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <CtaButton href={SITE.calendly} external>
              {SITE.primaryCta.short}
            </CtaButton>
          </div>
        </div>
      </Container>
    </header>
  );
}
