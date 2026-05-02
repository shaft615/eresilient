export const SITE = {
  name: "e|Resilient",
  legalName: "e|Resilient LLC",
  url: "https://eresilient.com",
  description:
    "ISO 22301-aligned business continuity consulting for small and mid-sized businesses. Build the plan that keeps your operations running when disruption hits.",
  tagline:
    "When disruption hits, your business keeps running — we build the plan that makes it possible.",
  founder: {
    name: "Karl Bryant",
    role: "Founder & Principal Consultant",
    credentials: [
      "25+ years Fortune 100 BCM experience",
      "ISO 22301 Aligned",
      "CBCP Certified",
      "SBA Recommended",
    ],
  },
  contact: {
    phone: "(312) 576-5202",
    phoneHref: "tel:+13125765202",
    email: "info@eresilient.com",
    emailHref: "mailto:info@eresilient.com",
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
} as const;

export const NAV = [
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
] as const;
