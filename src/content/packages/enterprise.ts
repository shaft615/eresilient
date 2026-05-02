import type { PackageContent } from "@/lib/content";

export const enterprise: PackageContent = {
  slug: "enterprise",
  title: "Enterprise",
  tagline:
    "Program tier plus ongoing governance, real-time activation support, and active supply chain monitoring.",
  startingAt: "$50,000",
  duration: "Year-1 build, then ongoing",
  order: 3,
  highlight: false,
  bestFor:
    "Operationally complex SMBs and lower-mid-market companies whose continuity exposure justifies a permanent BCM partner — boards, audit committees, or insurance carriers expect demonstrated, maintained capability.",
  includes: [
    "Everything in the Program tier",
    "Quarterly program governance reviews and management reporting",
    "Annual exercise schedule (mix of tabletop, functional, and DR tests)",
    "Active supply chain monitoring via riscManager.com™ with configured alert thresholds",
    "Real-Time Support retainer with named primary and backup consultant",
    "Pre-negotiated activation rates and on-call response window",
    "Annual plan refresh cycle with version control",
    "Audit and customer due-diligence response support",
    "Optional ISO 22301 certification preparation",
  ],
  excludes: [
    "Travel and on-site facilitation outside the contiguous U.S. (quoted separately)",
    "Major scope expansions (M&A integration, new business unit) re-quoted as additional engagements",
  ],
  ctaLabel: "Discuss an Enterprise engagement",
};
