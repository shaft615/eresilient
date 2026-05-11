import type { PackageContent } from "@/lib/content";

export const program: PackageContent = {
  slug: "program",
  title: "Program",
  tagline:
    "Full BCM program build covering all six service lines — your end-to-end resilience platform.",
  startingAt: "$25,000",
  duration: "12–16 weeks",
  order: 2,
  highlight: true,
  bestFor:
    "SMBs at 50–500 employees building a credible BCM program from the ground up — typically driven by enterprise customer due-diligence, ISO 22301 readiness, or material insurance/regulatory exposure.",
  includes: [
    "Enterprise risk assessment across facilities, technology, and supply base",
    "Multi-department Business Impact Analysis with consolidated recovery requirements",
    "Documented Business Continuity Plans for every critical function",
    "Crisis Management Plan with CMT governance, escalation triggers, and decision frameworks",
    "Emergency Response Plan with bespoke flip-charts and role assignments",
    "Initial Supply Chain Risk mapping with supplier risk register",
    "One full tabletop exercise with facilitated AAR and corrective action register",
    "Executive education for CMT members and role-based training for BCP coordinators and ER team leads",
    "Plan deployment to SharePoint, mobile, and paper formats",
    "ISO 22301 alignment documentation suitable for audit / customer due-diligence",
  ],
  excludes: [
    "Ongoing program governance after handoff (available via Enterprise tier)",
    "Real-Time activation support (available via Enterprise tier)",
    "Active supply chain monitoring beyond initial mapping",
  ],
  ctaLabel: "Discuss a Program engagement",
};
