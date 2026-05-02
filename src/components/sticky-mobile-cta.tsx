import { SITE } from "@/lib/site";

export function StickyMobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-taupe-mid/60 bg-brand-paper/95 px-4 py-3 backdrop-blur md:hidden">
      <a
        href={SITE.calendly}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center rounded-md bg-brand-orange px-5 py-3 text-sm font-semibold text-brand-paper shadow-sm shadow-brand-orange/30"
      >
        {SITE.primaryCta.short}
      </a>
    </div>
  );
}
