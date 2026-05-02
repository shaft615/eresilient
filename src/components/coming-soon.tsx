import { Container } from "./container";
import { CtaButton } from "./cta-button";
import { SITE } from "@/lib/site";

export function ComingSoon({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="py-24 sm:py-32">
      <Container width="narrow" className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-orange">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl text-brand-maroon sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-relaxed text-brand-ink-mid">
          {body}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <CtaButton href={SITE.calendly} external>
            {SITE.primaryCta.label}
          </CtaButton>
          <CtaButton href="/contact" variant="ghost">
            Other ways to reach us
          </CtaButton>
        </div>
      </Container>
    </section>
  );
}
