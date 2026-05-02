import { type ReactNode } from "react";
import { Container } from "./container";

export function LegalLayout({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="bg-brand-maroon py-16 text-brand-paper">
        <Container width="narrow">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.14em] text-brand-taupe">
            Effective {effectiveDate}
          </p>
        </Container>
      </section>
      <section className="py-16">
        <Container width="narrow">
          <div className="space-y-6 text-base leading-relaxed text-brand-ink-mid [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-brand-maroon [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-brand-maroon [&_a]:text-brand-orange [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-brand-ink [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:marker:text-brand-orange">
            {children}
          </div>
        </Container>
      </section>
    </>
  );
}
