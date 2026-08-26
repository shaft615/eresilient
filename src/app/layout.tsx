import type { Metadata } from "next";
import localFont from "next/font/local";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
    // icon.svg is mark.svg cropped to the artwork's true bounds. The master
    // mark sits on a 1920x1080 canvas, so in a square favicon slot the logo
    // shrank to ~9% of the space and read as an orange speck.
    icon: "/icon.svg",
    // iOS home-screen bookmarks need a PNG; without one iOS substitutes a
    // screenshot of the page. 180x180, mark on brand maroon, generated from
    // icon.svg. iOS applies its own rounded corners.
    apple: "/apple-touch-icon.png",
  },
  verification: GSC_VERIFICATION
    ? { google: GSC_VERIFICATION }
    : undefined,
};

// Clerk powers the /admin and /portal sign-in. Without keys (local dev,
// previews before provisioning) the provider is skipped and the portal
// pages render a setup notice instead — same graceful-degradation pattern
// as the DB and email layers.
const HAS_CLERK = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const tree = (
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
  return HAS_CLERK ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
