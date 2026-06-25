import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StickyMobileCta } from "@/components/sticky-mobile-cta";
import { JsonLd } from "@/components/json-ld";
import {
  organizationSchema,
  professionalServiceSchema,
} from "@/lib/structured-data";
import { SITE } from "@/lib/site";
import "./globals.css";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const aptos = localFont({
  variable: "--font-aptos",
  display: "swap",
  src: [
    { path: "../fonts/Aptos-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Aptos-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/Aptos-Bold.ttf", weight: "700", style: "normal" },
  ],
});

const aptosDisplay = localFont({
  variable: "--font-aptos-display",
  display: "swap",
  src: [
    { path: "../fonts/AptosDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/AptosDisplay-Bold.ttf", weight: "700", style: "normal" },
  ],
});

// Outfit is the shared RISC-family wordmark font (orange "risc" + ink remainder),
// matching the lockup on riscManager.com. Self-hosted by next/font at build time.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Business Continuity Consulting for SMBs`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.legalName,
  authors: [{ name: SITE.legalName, url: SITE.url }],
  openGraph: {
    type: "website",
    siteName: SITE.legalName,
    url: SITE.url,
    title: `${SITE.name} — Business Continuity Consulting for SMBs`,
    description: SITE.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Business Continuity Consulting for SMBs`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/mark.svg",
  },
  verification: GSC_VERIFICATION
    ? { google: GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${aptos.variable} ${aptosDisplay.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-paper text-brand-ink">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={professionalServiceSchema()} />
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <StickyMobileCta />
        {GA4_ID && process.env.NODE_ENV === "production" && (
          <GoogleAnalytics gaId={GA4_ID} />
        )}
      </body>
    </html>
  );
}
