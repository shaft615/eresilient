import type { ServiceContent } from "@/lib/content";

export const crisisManagement: ServiceContent = {
  slug: "crisis-management",
  title: "Crisis Management",
  shortTitle: "Crisis Management",
  category: "Leadership Response",
  summary:
    "Governance, team structure, and trigger protocols. Executive education and integrated crisis/BCM exercises that surface gaps before they cost you.",
  metaTitle: "Crisis Management Consulting & Planning | e|Resilient",
  metaDescription:
    "Build the leadership response capability that turns a disruption into a managed event. Crisis Management Team governance, escalation triggers, integrated BCM exercises, and executive readiness training from a Master Business Continuity Professional.",
  hero: {
    headline:
      "When the call comes in at 2 a.m., your team needs a structure — not a brainstorm.",
    description:
      "Crisis Management Planning establishes the governance, team structure, decision authority, and escalation protocols that turn a chaotic event into a managed response.",
  },
  problem:
    "Crisis Management is what happens before the BCP activates — the first 30 minutes when leadership has to decide whether this is real, who needs to be in the room, what the public position is, and which downstream plans to invoke. Without a documented Crisis Management Plan and a trained team, those 30 minutes routinely become 6 hours, and the cost of the delay is paid by every system, customer, and employee waiting on a decision.",
  whatsIncluded: [
    "Program governance development — charter, roles, and decision authorities",
    "Crisis Management Team (CMT) structure with named roles and succession",
    "Trigger protocols — what events activate, who declares, what the cascade looks like",
    "Plan document development — incident command structure, communication trees, decision logs",
    "Executive education — CMT walkthrough and role-specific briefings",
    "Integrated Crisis / BCM exercises — joint scenarios that test handoff between Crisis and Continuity teams",
  ],
  deliverables: [
    "Crisis Management Plan with activation criteria and decision flowcharts",
    "CMT roster with named primary and backup role-holders",
    "Communication templates for internal, customer, and media audiences",
    "Tabletop or functional exercise scenario, facilitation, and AAR",
    "Executive readiness briefing materials",
  ],
  whoItsFor: [
    "Companies that have a BCP but no documented crisis governance layer above it",
    "Leadership teams that have never run a real crisis exercise — or whose last one is more than 18 months old",
    "Organizations facing reputation, regulatory, or safety exposure where the first hour matters",
    "Boards or audit committees asking how crisis decisions get made and by whom",
  ],
  isoRefs: [
    "ISO 22301 §8.4.2 (Incident Response Structure)",
    "ISO 22361 (Crisis Management Guidance)",
  ],
  process: [
    {
      step: "01",
      title: "Governance Design",
      body: "We work with leadership to define the CMT charter — who sits on it, what it can decide, how it reports, and how it stands down.",
    },
    {
      step: "02",
      title: "Plan Development",
      body: "Trigger protocols, escalation paths, decision frameworks, and communication trees get documented in a plan your team can actually navigate during an event.",
    },
    {
      step: "03",
      title: "Executive Education",
      body: "Role-specific briefings for CMT members — what their seat is for, what decisions they own, and what tools they have. No slide deck dies in a crisis.",
    },
    {
      step: "04",
      title: "Integrated Exercise",
      body: "Joint Crisis/BCM tabletop or functional exercise validates the handoff between strategic decision-making and operational continuity execution.",
    },
  ],
  ctaLabel: "Schedule a crisis-readiness call",
  order: 2,
};
