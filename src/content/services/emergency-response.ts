import type { ServiceContent } from "@/lib/content";

export const emergencyResponse: ServiceContent = {
  slug: "emergency-response",
  title: "Emergency Response",
  shortTitle: "Emergency Response",
  category: "Operational Readiness",
  summary:
    "Bespoke emergency response plans built from your risk profile. Flip-charts, role definitions, and drills that prepare every shift, not just leadership.",
  metaTitle: "Emergency Response Planning for Business | e|Resilient",
  metaDescription:
    "Custom Emergency Response Plans built from your facility's risk assessment. Flip-charts, role definitions, team assignments, and facilitated drills — designed for the people on shift, not the people in the boardroom.",
  hero: {
    headline:
      "The emergency happens at the loading dock. The response has to start there too.",
    description:
      "Emergency Response Planning builds the practical, scenario-specific procedures that the people physically present can execute in the first sixty seconds — fire, medical, intruder, severe weather, hazmat.",
  },
  problem:
    "Emergency Response is the layer below Crisis Management and Business Continuity — it's what the shift supervisor, the receptionist, and the warehouse lead do in the first sixty seconds when something is actively happening. Generic templates downloaded from the internet don't account for your floor plan, your evacuation routes, your shelter-in-place locations, or who's actually on shift at 11 p.m. on a Saturday. Bespoke plans do.",
  whatsIncluded: [
    "Bespoke Emergency Response Plan development — built from your facility risk assessment",
    "Scenario coverage: fire, medical, severe weather, intruder, hazmat, utility loss",
    "Emergency Response Flip-charts — quick-reference guides that live where they're needed",
    "Role definitions and team assignments mapped to actual shift coverage",
    "Facilitated drills and exercises — fire, evacuation, shelter-in-place",
    "Coordination with local first responders and building management",
  ],
  deliverables: [
    "Documented Emergency Response Plan covering in-scope scenarios",
    "Printed flip-charts deployed to staff areas, reception, and operations posts",
    "Role assignment matrix with shift coverage validation",
    "Drill scenarios and facilitator scripts",
    "Drill After-Action Reports with corrective actions",
  ],
  whoItsFor: [
    "Facilities where a real emergency would be handled by frontline staff, not corporate leadership",
    "Multi-shift operations (manufacturing, healthcare, distribution) where coverage gaps matter",
    "Companies in OSHA-regulated industries or with insurance-driven drill requirements",
    "Sites that have evacuation procedures on paper but have never run an actual drill",
  ],
  isoRefs: [
    "ISO 22301 §8.4 (Business Continuity Procedures)",
    "ISO 22320 (Emergency Management — Incident Management)",
    "OSHA 29 CFR 1910.38 (Emergency Action Plans)",
  ],
  process: [
    {
      step: "01",
      title: "Site & Risk Walk",
      body: "We walk your facility — entrances, exits, assembly areas, hazards, equipment locations — and inventory the realistic scenarios you need to cover.",
    },
    {
      step: "02",
      title: "Plan & Flip-Chart Build",
      body: "Scenario-specific procedures get documented in plans and translated into laminated flip-charts deployed to the locations where they'll be reached for.",
    },
    {
      step: "03",
      title: "Role Assignment",
      body: "Roles get mapped against actual shift schedules — primary and backup for every position, every shift, including weekends and overnights.",
    },
    {
      step: "04",
      title: "Drill & Refine",
      body: "Facilitated drill runs the plan in real time. AAR captures what worked, what didn't, and what the plan needs to look like in version 1.1.",
    },
  ],
  ctaLabel: "Schedule an emergency-response call",
  order: 3,
};
