import type { PackageContent } from "@/lib/content";

export const foundation: PackageContent = {
  slug: "foundation",
  title: "Foundation",
  tagline: "BIA + BCP for one critical function — your first defensible plan.",
  startingAt: "$5,000",
  duration: "4–6 weeks",
  order: 1,
  highlight: false,
  bestFor:
    "Companies with no documented BCP, or a single department/function under regulatory or contractual pressure to demonstrate continuity capability.",
  includes: [
    "Risk assessment and threat profile for one in-scope function",
    "Department-level Business Impact Analysis (BIA) with RTO, RPO, and MTPD",
    "Strategy Selection Workshop with the function's leadership",
    "Documented Business Continuity Plan with activation criteria and roles",
    "Plan distribution package (digital + offline copies)",
    "60-minute plan walkthrough and Q&A",
  ],
  excludes: [
    "Crisis Management Plan and CMT governance",
    "Emergency Response Plan and drills",
    "Supply chain mapping and monitoring",
    "Tabletop exercise (available as add-on)",
  ],
  ctaLabel: "Discuss a Foundation engagement",
};
