/**
 * Outer layout for the BIA tool. Only sets metadata — auth is enforced by
 * the inner (authed) route group's layout. Sibling routes like /login render
 * unauthenticated.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "BIA Tool", template: "%s | BIA Tool" },
  robots: { index: false, follow: false },
};

export default function BiaToolOuterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
