import Image from "next/image";
import { SITE } from "@/lib/site";

export function Wordmark({
  variant = "default",
  className = "h-9 w-auto",
  priority = false,
}: {
  variant?: "default" | "on-dark";
  className?: string;
  priority?: boolean;
}) {
  const src =
    variant === "on-dark" ? "/wordmark-on-dark.svg" : "/wordmark.svg";
  return (
    <Image
      src={src}
      alt={SITE.name}
      width={1170}
      height={280}
      className={className}
      priority={priority}
    />
  );
}
