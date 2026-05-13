// Canonical URL falls through NEXT_PUBLIC_SITE_URL → VERCEL_PROJECT_PRODUCTION_URL
// → hardcoded canonical. The env-var override lets us point email links at the
// Vercel deploy URL during pre-cutover testing; once DNS cuts over to Vercel
// we can clear the override (or set it to the canonical) and emails will use
// https://eresilient.com automatically.
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://eresilient.com");

export const SITE = {
  name: "e|Resilient",
  legalName: "e|Resilient LLC",
  slogan: "Be Resilient. e|Resilient.",
  url: RAW_SITE_URL,
  description:
    "ISO 22301-aligned business continuity consulting for small and mid-sized businesses. Build the plan that keeps your operations running when disruption hits.",
  tagline:
    "When disruption hits, your business keeps running — we build the plan that makes it possible.",
  // Team-level credentials shown in headers/credibility bars
  team: {
    experience:
      "Over 30 years of practical and consulting experience in Business Continuity and Supply Chain Risk Management",
    credentials: [
      "30+ years Fortune 100 BCM",
      "MBCP · MBCI · CBCLA · CBCV · PMP",
      "ISO 22301 Aligned",
      "SBA Recommended",
    ],
    certifications: [
      { abbr: "MBCP", name: "Master Business Continuity Professional" },
      { abbr: "MBCI", name: "Member of the Business Continuity Institute" },
      { abbr: "CBCLA", name: "Certified Business Continuity Lead Auditor" },
      { abbr: "CBCV", name: "Certified Business Continuity Vendor" },
      { abbr: "PMP", name: "Project Management Professional" },
    ],
  },
  contact: {
    phone: "(833) PLAN-365",
    phoneDigits: "(833) 752-6365",
    phoneHref: "tel:+18337526365",
    email: "info@eresilient.com",
    emailHref: "mailto:info@eresilient.com",
    address: {
      street: "1 East Erie St, Suite 525-4252",
      city: "Chicago",
      region: "IL",
      postal: "60611",
      country: "US",
    },
  },
  calendly: "https://calendly.com/eresilient/30min",
  primaryCta: {
    label: "Schedule your free consultation",
    short: "Book consultation",
    href: "https://calendly.com/eresilient/30min",
  },
  // Federal contracting registration (federal/government adjacency)
  federal: {
    duns: "07-874-0691",
    cage: "989G7",
    ein: "45-4819000",
    naics: ["541611", "524298", "541618", "541690", "611420", "611430"],
  },
  // Industries served (for ICP messaging)
  industries: [
    "Manufacturing",
    "Healthcare",
    "Financial Services",
    "Logistics",
    "Retail",
    "Food & Beverage",
  ],
  // Past Fortune 100/500 client engagements (named in Corporate Charter)
  pastClients: [
    "3M",
    "Advance Auto / WorldPac",
    "Wells Enterprises",
    "Swisher International",
    "Bemis Company",
    "Dole Foods",
    "Hollister Inc.",
  ],
} as const;

export const NAV = [
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
] as const;
