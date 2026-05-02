import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
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

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
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
  authors: [{ name: SITE.founder.name }],
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-paper text-brand-ink">
        <JsonLd data={organizationSchema()} />
        <JsonLd data={professionalServiceSchema()} />
        <SiteHeader />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
        <SiteFooter />
        <StickyMobileCta />
      </body>
    </html>
  );
}
