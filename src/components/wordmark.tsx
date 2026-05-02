import { SITE } from "@/lib/site";

export function Wordmark({
  variant = "default",
  className = "",
}: {
  variant?: "default" | "on-dark";
  className?: string;
}) {
  const orange = "#FB5C01";
  const burgundy = variant === "on-dark" ? "#FDFCFB" : "#9D3057";
  return (
    <span
      className={`inline-flex items-baseline gap-1.5 font-display text-2xl tracking-tight ${className}`}
      aria-label={SITE.name}
    >
      <span style={{ color: orange }}>e</span>
      <span style={{ color: orange }} className="text-xl" aria-hidden="true">
        |
      </span>
      <span style={{ color: burgundy }}>Resilient</span>
    </span>
  );
}
