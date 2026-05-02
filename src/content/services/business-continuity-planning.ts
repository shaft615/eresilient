import type { ServiceContent } from "@/lib/content";

export const businessContinuityPlanning: ServiceContent = {
  slug: "business-continuity-planning",
  title: "Business Continuity Planning",
  shortTitle: "BCP",
  category: "Core Engagement",
  summary:
    "ISO 22301-aligned BCP development. Risk assessment, BIA, strategy selection, and tested plans deployed where your team will actually use them.",
  metaTitle:
    "Business Continuity Planning Consultant for Small Business | e|Resilient",
  metaDescription:
    "ISO 22301-aligned business continuity planning for SMBs. Automated BIA, strategy workshops, deployable BCPs with mobile and paper distribution, and tabletop exercises — built by a Master Business Continuity Professional with 25+ years of Fortune 100 practice.",
  hero: {
    headline:
      "Build a continuity program that actually works when you need it.",
    description:
      "An ISO 22301-aligned business continuity engagement covering everything from initial risk profiling through tested, deployed plans your team can execute under pressure.",
  },
  problem:
    "Most SMB continuity plans are documents nobody has opened in two years, naming roles held by people who left. When a real disruption hits — a vendor outage, a ransomware event, a building loss — the plan fails on first contact. We build programs that survive that contact, because they were designed against your real operations and tested before they were needed.",
  whatsIncluded: [
    "Natural Hazard and operational risk profile tailored to your facilities and supply base",
    "Automated Business Impact Analysis (BIA) model — per department or function — with quantified RTO, RPO, and MTPD",
    "Strategy Selection Workshop facilitated with your leadership team",
    "Coordination with IT for application availability requirements and DR alignment",
    "Automated Business Continuity Plan (BCP) module covering critical processes",
    "Plan deployment via secure SharePoint, mobile, and paper formats — wherever your team works",
    "Optional tabletop exercise with guided simulation and access to scenario library",
  ],
  deliverables: [
    "Risk assessment report with categorized threat register",
    "Department-level BIA with prioritized recovery requirements",
    "Documented Business Continuity Plans for each in-scope function",
    "Activation criteria, escalation paths, and named role assignments",
    "Plan distribution package (digital + offline access copies)",
    "Optional tabletop exercise After-Action Report and corrective action register",
  ],
  whoItsFor: [
    "SMBs with 10–500 employees facing customer or regulatory due-diligence on BCM maturity",
    "Companies with no documented BCP, or plans that haven't been touched in 24+ months",
    "Organizations preparing for ISO 22301 certification or audit",
    "Firms whose insurance, audit, or contractual obligations require demonstrated continuity capability",
  ],
  isoRefs: [
    "ISO 22301 §8.2.2 (Business Impact Analysis)",
    "ISO 22301 §8.3 (Business Continuity Strategies and Solutions)",
    "ISO 22301 §8.4 (Business Continuity Plans and Procedures)",
    "ISO/TS 22317 (BIA guidance)",
    "ISO/TS 22332 (BCP guidance)",
  ],
  process: [
    {
      step: "01",
      title: "Discovery & Risk Profile",
      body: "We map your operations, dependencies, facilities, and supplier base in a focused intake — typically one to two working sessions with leadership and operations leads.",
    },
    {
      step: "02",
      title: "Business Impact Analysis",
      body: "Department-level BIA quantifies what disruption costs you. RTO, RPO, MTPD, and resource dependencies become numbers, signed off by process owners.",
    },
    {
      step: "03",
      title: "Strategy & Plan Build",
      body: "Strategy selection workshop translates BIA outputs into recovery options. We then build the BCP module — activation criteria, escalation, role assignments, recovery procedures.",
    },
    {
      step: "04",
      title: "Deploy & Test",
      body: "Plans deploy to SharePoint, mobile, and paper. Optional tabletop exercise validates the plan against a realistic scenario; AAR findings drive plan refinement.",
    },
  ],
  ctaLabel: "Schedule a BCP discovery call",
  order: 1,
};
