import { type ReactNode } from "react";

export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  const max =
    width === "narrow" ? "max-w-3xl" : width === "wide" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={`${max} mx-auto px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
