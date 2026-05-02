export const SITE = {
  name: "e|Resilient",
  legalName: "e|Resilient LLC",
  slogan: "Be Resilient. e|Resilient.",
  url: "https://eresilient.com",
  description:
    "ISO 22301-aligned business continuity consulting for small and mid-sized businesses. Build the plan that keeps your operations running when disruption hits.",
  tagline:
    "When disruption hits, your business keeps running — we build the plan that makes it possible.",
  founder: {
    name: "Karl D. Bryant",
    shortName: "Karl Bryant",
    role: "Managing Principal",
    credentials: [
      "25+ years Fortune 100 BCM",
      "MBCP · MBCI · CBCLA · PMP",
      "ISO 22301 Aligned",
      "SBA Recommended",
    ],
    certifications: [
      { abbr: "MBCP", name: "Master Business Continuity Professional" },
      { abbr: "MBCI", name: "Member of the Business Continuity Institute" },
      { abbr: "CBCLA", name: "Certified Business Continuity Lead Auditor" },
      { abbr: "PMP", name: "Project Management Professional" },
    ],
  },
  contact: {
    phone: "(312) 576-5202",
    phoneHref: "tel:+13125765202",
    email: "karl.bryant@eresilient.com",
    emailHref: "mailto:karl.bryant@eresilient.com",
    address: {
      street: "4800 S Chicago Beach Dr, Suite 1901N",
      city: "Chicago",
      region: "IL",
      postal: "60615",
      country: "US",
    },
  },
  calendly: "https://calendly.com/karl-bryant-eresilient/30min",
  primaryCta: {
    label: "Schedule your free consultation",
    short: "Book consultation",
    href: "https://calendly.com/karl-bryant-eresilient/30min",
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
