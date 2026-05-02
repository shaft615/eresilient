import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "ghost" | "ghost-on-dark";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-orange text-brand-paper hover:bg-brand-orange-soft shadow-sm shadow-brand-orange/30",
  ghost:
    "border border-brand-ink/20 text-brand-ink hover:border-brand-orange hover:text-brand-orange",
  "ghost-on-dark":
    "border border-brand-paper/30 text-brand-paper hover:border-brand-orange hover:text-brand-orange",
};

export function CtaButton({
  href,
  children,
  variant = "primary",
  external,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold tracking-wide transition-colors";
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
