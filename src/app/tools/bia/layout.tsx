/**
 * Outer layout for the BIA tool. Sets metadata and the tool's own look —
 * auth is enforced by the inner (authed) route group's layout. Sibling routes
 * like /login render unauthenticated.
 */
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./bia.css";

const display = Archivo({
  variable: "--font-bia-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});
const body = IBM_Plex_Sans({
  variable: "--font-bia-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const mono = IBM_Plex_Mono({
  variable: "--font-bia-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "BIA Tool", template: "%s | BIA Tool" },
  robots: { index: false, follow: false },
};

export default function BiaToolOuterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`bia ${display.variable} ${body.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
